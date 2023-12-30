const { ApplicationCommandOptionType, Client, CommandInteraction, EmbedBuilder, Colors } = require("discord.js");
const config = require("../../../config");
const { manager } = require("../..");
const { getDatabase } = require("../../modules/handlers/database");

module.exports = {
    name: "music",
    category: "Music",
    description: "Music commands",
    devOnly: false,
    disabled: false,
    channelOnly: ["music-commands"],
    roleRequired: [],
    options: [{
        type: ApplicationCommandOptionType.Subcommand,
        name: "play",
        description: "Play a song",
        options: [{
            type: ApplicationCommandOptionType.String,
            name: "query",
            description: "The song to play",
            required: true
        }]
    }, {
        type: ApplicationCommandOptionType.Subcommand,
        name: "stop",
        description: "Stop the music player"
    }, {
        type: ApplicationCommandOptionType.Subcommand,
        name: "skip",
        description: "Skip the current song",
        options: [{
            type: ApplicationCommandOptionType.Integer,
            name: "amount",
            description: "The amount of songs to skip",
            required: false
        }]
    }, {
        type: ApplicationCommandOptionType.Subcommand,
        name: "queue-list",
        description: "Show the music queue"
    }, {
        type: ApplicationCommandOptionType.Subcommand,
        name: "queue-clear",
        description: "Clear the music queue"
    }, {
        type: ApplicationCommandOptionType.Subcommand,
        name: "queue-shuffle",
        description: "Shuffle the music queue"
    }, {
        type: ApplicationCommandOptionType.Subcommand,
        name: "loop",
        description: "Loop mode",
        options: [{
            type: ApplicationCommandOptionType.String,
            name: "mode",
            description: "The loop mode",
            required: true,
            choices: [{
                name: "Track Loop",
                value: "track-loop"
            }, {
                name: "Queue Loop",
                value: "queue-loop"
            }, {
                name: "Disable",
                value: "disable-loop"
            }]
        }]
    }, {
        type: ApplicationCommandOptionType.Subcommand,
        name: "volume",
        description: "Set the music volume",
        options: [{
            type: ApplicationCommandOptionType.Integer,
            name: "set",
            description: "The volume to set",
            required: true
        }]
    }, {
        type: ApplicationCommandOptionType.Subcommand,
        name: "now-playing",
        description: "Show the current song"
    }, {
        type: ApplicationCommandOptionType.Subcommand,
        name: "pause",
        description: "Pause the music player"
    }, {
        type: ApplicationCommandOptionType.Subcommand,
        name: "resume",
        description: "Resume the music player"
    }, {
        type: ApplicationCommandOptionType.Subcommand,
        name: "mute",
        description: "Mute the music player"
    }, {
        type: ApplicationCommandOptionType.Subcommand,
        name: "unmute",
        description: "Unmute the music player",
    }],
    execute: async (/**@type {Client} */ client, /**@type {CommandInteraction} */ interaction) => {
        if (!config.musicSupport.enabled) return interaction.reply({ content: "Music support is disabled.", ephemeral: true });

        const subCommands = interaction.options.getSubcommand();
        let player = manager.get(interaction.guild.id);
        let queue, current;

        if (player) {
            queue = player.queue;
            current = queue.current;
        }

        const voiceConnection = interaction.member.voice.channel;
        if (!voiceConnection) return interaction.reply({ content: "You must be in a voice channel to use this command.", ephemeral: true });

        if (player && voiceConnection && player.playing && player.voiceChannel.id !== voiceConnection.id) return interaction.reply({ content: "You must be in the same voice channel as the music player to use this command.", ephemeral: true });

        await interaction.deferReply({ ephemeral: false });

        if (subCommands == "play") {
            if (!player) {
                player = manager.create({
                    guild: interaction.guild.id,
                    voiceChannel: voiceConnection.id,
                    textChannel: interaction.channelId,
                    selfDeafen: false,
                    selfMute: false,
                    volume: 100,
                });
            };

            if (player.state !== "CONNECTED") player.connect();

            const search = interaction.options.getString("query");
            let res;

            try {
                res = await player.search(search, interaction.user);
                if (res.loadType === "LOAD_FAILED") {
                    if (!player.queue.current) player.destroy();
                    throw res.exception;
                }
            } catch (e) {
                await interaction.editReply({
                    content: `An error occurred while searching for your query`,
                });
            }

            switch (res.loadType) {
                case "NO_MATCHES":
                    if (!player.queue.current) player.destroy();
                    return interaction.editReply({
                        content: "No matches found!",
                    });

                case "SEARCH_RESULT":
                case "TRACK_LOADED":
                    player.queue.add(res.tracks[0]);
                    if (!player.playing && !player.paused && !player.queue.size)
                        player.play();

                    let title = res.tracks[0].title;
                    if (title.includes("*")) title = title.replaceAll("*", "");
                    if (title.includes("`")) title = title.replaceAll("`", "");
                    if (title.length > 45) title = title.substring(0, 45) + "...";

                    return interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(Colors.Blurple)
                                .setAuthor({
                                    name: "Added track to the queue"
                                })
                                .setDescription([
                                    `- [**${title}**](${res.tracks[0].uri})`,
                                ].join("\n"))
                                .setFooter({
                                    text: `Requested by ${interaction.user.username}`,
                                    iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
                                })
                        ]
                    })
                case "PLAYLIST_LOADED":
                    player.queue.add(res.tracks);
                    if (!player.playing && !player.paused) {
                        player.play();
                    }

                    return interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(Colors.Blurple)
                                .setAuthor({
                                    name: "Added playlist to the queue"
                                })
                                .setDescription([
                                    `- **\` Playlist Title  \`** • [**\`${res[res.playlist ? "playlist" : "playlistInfo"].name || "Unknown"}\`**](${search})`,
                                    `- **\` Playlist Tracks \`** • ${player.queue.size}`,
                                ].join("\n"))
                                .setFooter({
                                    text: `Requested by ${interaction.user.username}`,
                                    iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
                                })
                        ]
                    })
            }
        }

        if (!player) return interaction.editReply({
            content: "There is no music player to manage",
        });

        switch (subCommands) {
            case "stop": {
                player.queue.clear();
                player.stop();

                return interaction.reply({
                    content: "🛑 • The queue as been **cleared** and player has been **stopped**"
                });
            }

            case "skip": {
                if (!current) {
                    return interaction.reply({
                        content: "Nothing is being played currently"
                    })
                };

                const amount = interaction.options.getNumber("amount") || 1;

                if (amount > queue.length) {
                    return interaction.reply({
                        content: "Can't be skipped as provided tracks to skip are more then queue size"
                    });
                };

                player.stop(amount);
                return interaction.reply({
                    content: "🦘 • Player skipped **" + amount + "** track(s)"
                });
            }

            case "pause": {
                if (!current) {
                    return interaction.reply({
                        content: "Nothing is being played currently"
                    })
                };

                if (player.paused) {
                    return interaction.reply({
                        content: "Player is already paused"
                    });
                };

                player.pause(true);
                return interaction.reply({
                    content: "⏸ • Player has been **paused**"
                })
            }

            case "resume": {
                if (!current) {
                    return interaction.reply({
                        content: "Nothing is being played currently"
                    })
                }

                if (!player.paused) {
                    return interaction.reply({
                        content: "Player is not paused"
                    });
                }

                player.pause(false);
                return interaction.reply({
                    content: "⏯ • Player has been **resumed**"
                });
            }

            case "volume": {
                const set = interaction.options.getNumber("set");

                if (set < 0 || set > 100) return interaction.reply({
                    content: "Volume must be between 0 and 100"
                });

                player.setVolume(set);
                return interaction.reply({
                    content: "🔊 • Volume has been set to **" + set + "**"
                });
            }

            case "mute": {
                if (player.volume == 0) {
                    return interaction.reply({
                        content: "Player is already muted"
                    });
                }

                player.setVolume(0);
                return interaction.reply({
                    content: "🔇 • Player has been **muted**"
                });
            }

            case "unmute": {
                if (player.volume !== 0) {
                    return interaction.reply({
                        content: "Player is not muted"
                    });
                }

                player.setVolume(100);
                return interaction.reply({
                    content: "🔊 • Player has been **unmuted**"
                });
            }

            case "queue-shuffle": {
                if (!current) {
                    return interaction.reply({
                        content: "Nothing is being played currently"
                    })
                }

                if (queue.length <= 2) {
                    return interaction.reply({
                        content: "Can't shuffle as there is less then 3 tracks in queue"
                    });
                }

                queue.shuffle();
                return interaction.reply({
                    content: "🔀 • Queue has been **shuffled**"
                });
            }

            case "queue-clear": {
                if (queue.length <= 1) {
                    return interaction.reply({
                        content: "Can't clear queue as there is less then 2 tracks in queue"
                    });
                }

                queue.clear();
                return interaction.reply({
                    content: "🧹 • Queue has been **cleared**"
                })
            }

            case "queue-list": {
                return interaction.reply({
                    content: "Not coded yet"
                });
            }

            case "loop": {
                if (!current) {
                    return interaction.reply({
                        content: "Nothing is being played currently"
                    })
                };

                const mode = interaction.options.getString("mode");

                switch (mode) {
                    case "track-loop": {
                        if (player.queueRepeat) player.setQueueRepeat(false);
                        if (player.trackRepeat) {
                            player.setTrackRepeat(false)
                            return interaction.reply({
                                content: "🎵 • Player **disabled** track-repeat mode"
                            })
                        } else {
                            player.setTrackRepeat(true)
                            return interaction.reply({
                                content: "🎵 • Player **enabled** track-repeat mode"
                            })
                        }
                    }

                    case "queue-loop": {
                        if (player.trackRepeat) player.setTrackRepeat(false);
                        if (player.queueRepeat) {
                            player.setQueueRepeat(false)
                            return interaction.reply({
                                content: "🎵 • Player **disabled** queue-repeat mode"
                            })
                        } else {
                            player.setQueueRepeat(true)
                            return interaction.reply({
                                content: "🎵 • Player **enabled** queue-repeat mode"
                            })
                        }
                    }

                    case "disable-loop": {
                        if (player.trackRepeat) player.setTrackRepeat(false);
                        if (player.queueRepeat) player.setQueueRepeat(false);
                        return interaction.reply({
                            content: "🎵 • Player **disabled** all loop modes"
                        })
                    }
                }
            }

            case "now-playing": {
                if (!current) {
                    return interaction.reply({
                        content: "Nothing is being played currently"
                    })
                };

                let title = current.title;
                if (title.includes("*")) title = title.replaceAll("*", "");
                if (title.includes("`")) title = title.replaceAll("`", "");
                if (track.title.length > 40) title = track.title.substring(0, 40) + "...";

                return interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Colors.Blurple)
                            .setAuthor({
                                name: "Info about current track",
                                iconURL: client.user.displayAvatarURL({ dynamic: true }),
                            })
                            .setFields([{
                                name: "Track Title",
                                value: `> [**\`${title}\`**](${current.uri})`,
                                inline: false,
                            }, {
                                name: "Track Duration",
                                value: `> ${ms(current.duration, { long: true })}`,
                                inline: true,
                            }, {
                                name: "Track Author",
                                value: `> **${current.author}**`,
                                inline: true,
                            }, {
                                name: "Track Requester",
                                value: `> <@${current.requester.id}>`,
                                inline: true,
                            }, {
                                name: "Current Settings",
                                value: [
                                    "```",
                                    `🔊 Volume     • ${player.volume}%`,
                                    `🎵 Loop Track • ${player.trackRepeat ? "Enabled" : "Disabled"}`,
                                    `🎶 Loop Queue • ${player.queueRepeat ? "Enabled" : "Disabled"}`,
                                    "```"
                                ].join("\n")
                            }])
                            .setImage(track.displayThumbnail("mqdefault"))
                            .setFooter({
                                text: interaction.user.username,
                                iconURL: interaction.user.displayAvatarURL()
                            })
                            .setTimestamp(Date.now())
                    ]
                })
            }
        }
    }
}