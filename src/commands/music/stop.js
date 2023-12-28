const { ApplicationCommandOptionType, Client, CommandInteraction } = require("discord.js");
const { manager } = require("../..");
const config = require("../../../config");

module.exports = {
    name: "stop",
    category: "Music",
    description: "Stop and clear the queue",
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

        const current = player.queue.current;
        if(!current) {
            return interaction.reply({
                content: "Nothing is being played currently"
            })
        };

        player.queue.clear();
        player.stop();

        return interaction.reply({
            content: "🛑 • The queue as been **cleared** and player has been **stopped**" 
        });
    }
}