const { ApplicationCommandOptionType, Client, CommandInteraction } = require("discord.js");
const { manager } = require("../..");
const config = require("../../../config");

module.exports = {
    name: "clear-queue",
    category: "Music",
    description: "Clear the queue",
    devOnly: false,
    disabled: false,
    channelOnly: ["music-commands"],
    roleRequired: [],
    options: [],
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

        if(player.queue.length) {
            player.queue.clear();
            return interaction.reply({
                content: "🔀 • Queue has been **cleared**"
            });
        } else {
            return interaction.reply({
                content: "Not enough tracks to be cleared"
            });
        }
    }
}