const { Client, ChatInputCommandInteraction, Message } = require("discord.js");

module.exports = {
    enabled: true,
    name: "",
    description: "",
    devOnly: false,
    adminOnly: false,
    aliases: [],
    allowedChannels: [],
    allowedRoles: [],
    options: [],

    /**
     * 
     * @param {Client} client 
     * @param {ChatInputCommandInteraction} interaction 
     */

    runSlash: async (client, interaction) => {

    },

    /**
     * 
     * @param {Client} client 
     * @param {Message} message 
     * @param {Array} args 
     */

    runLegacy: async (client, message, args) => {

    }
}