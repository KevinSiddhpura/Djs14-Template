const { REST, Routes, Client } = require("discord.js");
const { getCommands } = require("../../../modules/utils");
const logger = require("../../../modules/logger");
const config = require("../../../../config");

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

/**
 * @param {Client} client 
 */

module.exports = async (/**@type {Client} */ client) => {
    try {
        const commands = getCommands().map((c) => {
            return {
                name: c.name,
                description: c.description,
                options: c.options,
            };
        });

        if (config.serverID === "") {
            logger.error("Server ID not set in config.json");
            return process.exit(1);
        }

        const guild = client.guilds.cache.get(config.serverID);
        if (!guild) {
            logger.error("Could not find guild with ID: " + config.serverID + " (mentioned in config.json)");
            process.exit(1);
            return;
        }

        const data = await rest.put(
            Routes.applicationGuildCommands(client.user.id, guild.id),
            { body: commands }
        );

        if (config.extraStartUpLogs) {
            commands.forEach((c) => {
                logger.update(`Registered: ${c.name}`);
            })
        }

        logger.system("Registered " + data.length + " commands.");
    } catch (e) {
        console.error(e);
    }
}