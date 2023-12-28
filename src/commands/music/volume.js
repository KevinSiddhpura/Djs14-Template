const { ApplicationCommandOptionType, Client, CommandInteraction } = require("discord.js");
const { manager } = require("../..");
const config = require("../../../config");

module.exports = {
    name: "volume",
    category: "Music",
    description: "Manage player volume",
    devOnly: false,
    disabled: false,
    channelOnly: ["music-commands"],
    roleRequired: [],
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: "set",
            description: "Set volume to a specific value",
            choices: [
                { name: "10%", value: "10" },
                { name: "15%", value: "15" },
                { name: "20%", value: "20" },
                { name: "25%", value: "25" },
                { name: "30%", value: "30" },
                { name: "35%", value: "35" },
                { name: "40%", value: "40" },
                { name: "45%", value: "45" },
                { name: "50%", value: "50" },
                { name: "55%", value: "55" },
                { name: "60%", value: "60" },
                { name: "65%", value: "65" },
                { name: "70%", value: "70" },
                { name: "75%", value: "75" },
                { name: "80%", value: "80" },
                { name: "85%", value: "85" },
                { name: "90%", value: "90" },
                { name: "95%", value: "95" },
                { name: "100%", value: "100" },
            ],
            required: true,
        }
    ],
    execute: async (/**@type {Client} */ client, /**@type {CommandInteraction} */ interaction) => {
        
    }
}