const { ApplicationCommandOptionType, Client, CommandInteraction } = require("discord.js");
const { manager } = require("../..");
const config = require("../../../config");

module.exports = {
    name: "stop",
    category: "Music",
    description: "Stop and clear the queue",
    devOnly: false,
    disabled: false,
    roleRequired: false,
    options: [],
    execute: async (/**@type {Client} */ client, /**@type {CommandInteraction} */ interaction) => {
        
    }
}