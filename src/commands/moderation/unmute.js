const { ApplicationCommandOptionType, Client, CommandInteraction } = require("discord.js");

module.exports = {
    name: "unmute",
    category: "Moderation",
    description: "Unmute a user",
    devOnly: false,
    disabled: false,
    roleRequired: ["Mod"],
    options: [
        {
            type: ApplicationCommandOptionType.User,
            name: "member",
            description: "Mention the user to unmute",
            required: true,
        },
        {
            type: ApplicationCommandOptionType.String,
            name: "reason",
            description: "Reason for the unmute",
            required: false,
        }
    ],
    execute: async (/**@type {Client} */ client, /**@type {CommandInteraction} */ interaction) => {
        
    }
}