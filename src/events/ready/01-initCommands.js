const { REST, Routes, Client } = require("discord.js");
const { getCommands } = require("../../modules/utils");
const { config } = require("../..");
const logger = require("../../modules/logger");

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

module.exports = async (/**@type {Client} */ client) => {
    try {
        const commands = getCommands().map((c) => {
            return {
                name: c.name,
                description: c.description,
                options: c.options,
            };
        });

        const guild = await client.guilds.fetch(config.serverID);
        if (!guild) return;

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