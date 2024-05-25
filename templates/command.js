const { ApplicationCommandType, ApplicationCommandOptionType } = require("discord.js");
const { Command } = require("../src/handlers/helpers/command");

module.exports = new Command({
    // Optional | Default is true
    enabled: true,
    name: "name",
    description: "description",
    category: "category",
    type: ApplicationCommandType.ChatInput,
    // Optional | Default is []
    options: [{
        type: ApplicationCommandOptionType.String,
        name: "name",
        description: "description",
        required: false,
    }],
    // Optional | Default is false
    devOnly: false,
    // Optional | Default is false
    adminOnly: false,
    aliases: [],
    // Optional | Default is [] | Accepts Names & IDs
    allowedChannels: [],
    // Optional | Default is [] | Accepts Names & IDs
    allowedRoles: [],
    // For slash commands | Type ChatInput
    runSlash: async (client, interaction) => { },
    // For slash commands | Type ChatInput
    runLegacy: async (client, message, args) => { },
    // For slash commands | Type Message
    runContextMessage: async (client, interaction) => { },
    // For slash commands | Type User
    runContextUser: async (client, interaction) => { },
})