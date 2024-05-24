const { Client } = require("discord.js");
const logger = require("../../handlers/helpers/logger");
const { registerCommands } = require("../../handlers/utils");

module.exports = {
    once: true,
    
    /**
     * @param {Client} client 
     */

    run: async (client) => {
        logger.info(`Logged in as ${client.user.username}!`);
        await registerCommands(client, process.env.TOKEN, "dev");
    }
}