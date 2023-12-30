const { ApplicationCommandOptionType, Client, CommandInteraction } = require("discord.js");

module.exports = {
    name: "-",
    category: "-",
    description: "-",
    devOnly: false,
    disabled: false,
    channelOnly: ["commands"], // false/[] = works in all the channels
    roleRequired: ["Members"], // false/[] = works in all the channels
    options: [],
    execute: async (/**@type {Client} */ client, /**@type {CommandInteraction} */ interaction) => {
        
    }
}