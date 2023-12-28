const { ApplicationCommandOptionType, Client, CommandInteraction } = require("discord.js");
const { manager } = require("../..");
const config = require("../../../config");

module.exports = {
    name: "skip",
    category: "Music",
    description: "Skip the current song/to a song in the queue",
    devOnly: false,
    disabled: false,
    roleRequired: false,
    options: [
        {
            type: ApplicationCommandOptionType.Integer,
            name: "skip",
            description: "No. of songs to skip",
            required: false,
        }
    ],
    execute: async (/**@type {Client} */ client, /**@type {CommandInteraction} */ interaction) => {
        
    }
}