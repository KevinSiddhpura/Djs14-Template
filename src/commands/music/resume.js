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
        
    }
}