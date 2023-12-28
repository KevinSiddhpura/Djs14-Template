const { ApplicationCommandOptionType, Client, CommandInteraction } = require("discord.js");
const { manager } = require("../..");
const config = require("../../../config");

module.exports = {
    name: "skip",
    category: "Music",
    description: "Skip the current song/to a song in the queue",
    devOnly: false,
    disabled: false,
    channelOnly: ["music-commands"],
    roleRequired: [],
    options: [
        {
            type: ApplicationCommandOptionType.Number,
            name: "skip",
            description: "No. of songs to skip",
            required: false,
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

        const amt = interaction.options.getNumber("skip") || 1;

        const queueSize = player.queue.length;
        
        if(amt > queueSize) {
            return interaction.reply({
                content: "Can't be skipped as provided tracks to skip are more then queue size"
            });
        } else {
            player.stop(amt);
            return interaction.reply({
                content: "🦘 • Player skipped **" + amt + "** track(s)"
            });
        }
    }
}