const { REST, Routes, Client } = require("discord.js");
const { getCommands } = require("../../modules/utils");
const { config } = require("../..");
const logger = require("../../modules/logger");

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

const registerCommands = async (client, guildId, commands) => {
    try {
        const data = await rest.put(
            Routes.applicationGuildCommands(client.user.id, guildId),
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

module.exports = async (/**@type {Client} */ client) => {
    try {
        const commands = getCommands();
        const mappedCommands = commands.map((c) => {
            return {
                name: c.name,
                description: c.description,
                options: c.options,
            }
        });

        const guild = await client.guilds.fetch(config.serverID);
        if (!guild) return;

        if (config.alwaysRefreshCmds) {
            const gCmds = await guild.commands.fetch();
            if (!gCmds) logger.warn("No commands found.");

            gCmds.forEach(async (cmd) => {
                cmd.delete().catch(e => logger.error(e));
                if (config.extraStartUpLogs) logger.warn(`Deleted: ${cmd.name}`);
            });

            logger.system("Commands deleted.");
        };

        await registerCommands(client, config.serverID, mappedCommands);

    } catch (e) {
        console.error(e);
    }
}