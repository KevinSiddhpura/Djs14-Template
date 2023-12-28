const { ApplicationCommandOptionType, Client, CommandInteraction } = require("discord.js");

module.exports = {
    name: "-",
    category: "-",
    description: "-",
    devOnly: true,
    disabled: true,
    channelOnly: ["commands"], // false/[] = works in all the channels
    roleRequired: ["Members"], // false/[] = works in all the channels
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: "code",
            description: "Code to eval",
            required: true,
        }
    ],
    execute: async (/**@type {Client} */ client, /**@type {CommandInteraction} */ interaction) => {
        interaction.reply({
            content: "Your command logic goes here!",
            ephemeral: true,
        })
    }
}