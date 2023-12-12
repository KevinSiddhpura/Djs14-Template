const { ApplicationCommandOptionType, Client, CommandInteraction } = require("discord.js");

module.exports = {
    name: "eval",
    category: "Developer",
    description: "Evaluates JavaScript code.",
    devOnly: true,
    disabled: true,
    roleRequired: false,
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: "code",
            description: "The code to evaluate.",
            required: true
        }
    ],
    execute: async (/**@type {Client} */ client, /**@type {CommandInteraction} */ interaction) => {
        interaction.reply({
            content: "Your command logic goes here!",
            ephemeral: true,
        })
    }
}