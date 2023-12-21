const { ApplicationCommandOptionType, Client, CommandInteraction } = require("discord.js");

module.exports = {
    name: "unban",
    category: "Moderation",
    description: "Unban a user",
    devOnly: false,
    disabled: false,
    roleRequired: ["Admin"],
    options: [
        {
            type: ApplicationCommandOptionType.User,
            name: "member",
            description: "Mention the user to unban",
            required: true,
        },
        {
            type: ApplicationCommandOptionType.String,
            name: "reason",
            description: "Reason for the unban",
            required: false,
        }
    ],
    execute: async (/**@type {Client} */ client, /**@type {CommandInteraction} */ interaction) => {
        
    }
}