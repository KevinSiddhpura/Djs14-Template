const { ButtonStyle } = require("discord.js");

module.exports = {
    dev_guild: "923216789956100146",
    devs: ["528627987667615755", "215712513067712513"],
    
    prefixes: [".", "x"],

    paginationButtons: {
        toFirst: {
            emoji: "⏮️",
            style: ButtonStyle.Primary,
            disabled: false,
            showButton: true
        },
        toPrevious: {
            emoji: "⬅️",
            style: ButtonStyle.Secondary,
            disabled: false,
            showButton: true
        },
        toNext: {
            emoji: "➡️",
            style: ButtonStyle.Secondary,
            disabled: false,
            showButton: true
        },
        toLast: {
            emoji: "⏭️",
            style: ButtonStyle.Primary,
            disabled: false,
            showButton: true
        }
    },
}