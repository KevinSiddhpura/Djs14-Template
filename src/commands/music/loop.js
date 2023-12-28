const { ApplicationCommandOptionType, Client, CommandInteraction } = require("discord.js");
const { manager } = require("../..");
const config = require("../../../config");

module.exports = {
    name: "loop",
    category: "Music",
    description: "Select from queue/track loop",
    devOnly: false,
    disabled: false,
    channelOnly: ["music-commands"],
    roleRequired: [],
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: "mode",
            description: "Select a mode",
            choices: [
                {
                    name: "Track loop mode",
                    value: "track-loop"
                },
                {
                    name: "Queue loop mode",
                    value: "queue-loop"
                },
                {
                    name: "Disable loop mode",
                    value: "disable-loop"
                }
            ],
            required: true,
        }
    ],
    execute: async (/**@type {Client} */ client, /**@type {CommandInteraction} */ interaction) => {
        if(!config.musicSupport.enabled) return interaction.reply({
            content: "Music support is disabled!",
            ephemeral: true,
        });

        const player = manager.get(interaction.guild.id);
        if(!player) {
            return interaction.reply({
                content: "No active player found",
                ephemeral: true,
            });
        }

        const current = player.queue.current;
        if(!current) {
            return interaction.reply({
                content: "Nothing is being played currently"
            })
        };

        const mode = interaction.options.getString("mode");

        switch(mode) {
            case "track-loop": {
                if(player.queueRepeat) player.setQueueRepeat(false);
                if(player.trackRepeat) {
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
                if(player.trackRepeat) player.setTrackRepeat(false);
                if(player.queueRepeat) {
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
                player.setTrackRepeat(false)
                player.setQueueRepeat(false)

                return interaction.reply({
                    content: "🛑 • Player track and queue loop **disabled**"
                });
            }
        }
    }
}