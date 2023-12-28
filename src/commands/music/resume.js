const { ApplicationCommandOptionType, Client, CommandInteraction } = require("discord.js");
const { manager } = require("../..");
const config = require("../../../config");

module.exports = {
    name: "resume",
    category: "Music",
    description: "Resume the player",
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

        const track = player.queue.current;
        if(!track) {
            return interaction.reply({
                content: "No active track found",
                ephemeral: true,
            });
        }

        if(!player.paused) {
            return interaction.reply({
                content: "Player is already playing"
            });
        } else {
            player.pause(false);
            return interaction.reply({
                content: "▶ • Player has been **resumed**"
            })
        }
    }
}