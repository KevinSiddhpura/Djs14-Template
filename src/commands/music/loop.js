const { ApplicationCommandOptionType, Client, CommandInteraction } = require("discord.js");
const { manager } = require("../..");
const config = require("../../../config");

module.exports = {
    name: "loop",
    category: "Music",
    description: "Select from queue/track loop",
    devOnly: false,
    disabled: false,
    roleRequired: false,
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: "mode",
            description: "Select a mode",
            choices: [
                {
                    name: "Track loop mode",
                    value: "track-loop"
                },
                {
                    name: "Queue loop mode",
                    value: "queue-loop"
                },
                {
                    name: "Disable loop mode",
                    value: "disable-loop"
                }
            ],
            required: true,
        }
    ],
    execute: async (/**@type {Client} */ client, /**@type {CommandInteraction} */ interaction) => {
        
    }
}