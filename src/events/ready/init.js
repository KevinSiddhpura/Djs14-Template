const { Client } = require("discord.js");
const logger = require("../../handlers/helpers/logger");
const Utils = require("../../handlers/utils");

module.exports = {
    once: true,

    /**
     * @param {Client} client 
     */

    run: async (client) => {
        logger.info(`Logged in as ${client.user.username}!`);
        Utils.registerCommands(client);
    }
}