const { ApplicationCommandOptionType, Client, CommandInteraction, messageLink, EmbedBuilder, Colors } = require("discord.js");
const { manager } = require("../..");
const config = require("../../../config");

module.exports = {
    name: "play",
    category: "Music",
    description: "Import a song/playlist",
    devOnly: false,
    disabled: false,
    channelOnly: ["music-commands"],
    roleRequired: [],
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: "query",
            description: "Provide a song/playlist/url",
            required: true,
        }
    ],
    execute: async (/**@type {Client} */ client, /**@type {CommandInteraction} */ interaction) => {
        if (!config.musicSupport.enabled) return interaction.reply({
            content: "Music support is disabled!",
            ephemeral: true,
        });

        await interaction.deferReply({ ephemeral: false });

        const voiceChannel = interaction.member.voice.channelId;
        if (!voiceChannel) return interaction.reply({
            content: "You must be in a voice channel!",
            ephemeral: true,
        })

        let player = manager.get(interaction.guild.id);
        if (!player) {
            player = manager.create({
                guild: interaction.guild.id,
                voiceChannel,
                textChannel: interaction.channelId,
                selfDeafen: false,
                selfMute: false,
                volume: 100,
            });
        };

        if (player && player.playing && player.voiceChannel !== voiceChannel) return interaction.reply({
            content: "You must be in the same voice channel as me!",
            ephemeral: true,
        });

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
                if (title.length > 38) title = title.substring(0, 38) + "...";

                return interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Colors.Blurple)
                            .setAuthor({
                                name: "Added track to the queue",
                                iconURL: client.user.displayAvatarURL({ dynamic: true }),
                            })
                            .setDescription([
                                `- **\` Title  \`** • [**\`${title}\`**](${res.tracks[0].uri})`,
                                `- **\` Author \`** • _${res.tracks[0].author}_`,
                            ].join("\n"))
                            .setThumbnail("https://cdn.discordapp.com/attachments/995980173755305996/1005068015861239849/logo.gif")
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
                            name: "Added playlist to the queue",
                            iconURL: client.user.displayAvatarURL({ dynamic: true }),
                        })
                        .setDescription([
                            `- **\` Playlist Title  \`** • [**\`${res[res.playlist ? "playlist" : "playlistInfo"].name || "Unknown"}\`**](${search})`,
                            `- **\` Playlist Tracks \`** • ${player.queue.size}`,
                        ].join("\n"))
                        .setThumbnail("https://cdn.discordapp.com/attachments/995980173755305996/1005068015861239849/logo.gif")
                            .setFooter({
                                text: `Requested by ${interaction.user.username}`,
                                iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
                            })
                    ]
                })
        }
    }
}