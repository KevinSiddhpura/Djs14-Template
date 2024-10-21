const { ButtonStyle } = require("discord.js");

module.exports = {
    dev_guild: "",
    devs: [""],

    prefixes: ["!"],

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