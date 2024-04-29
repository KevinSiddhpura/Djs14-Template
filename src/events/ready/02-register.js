const { Routes, REST, ApplicationCommandType } = require("discord.js");
const { devMode, devGuild } = require("../../constants");
const { getFiles } = require("../../modules/utils");
const { commands } = require("../..");
const path = require("path");

module.exports = async (client) => {
    const commandFolders = getFiles(path.join(__dirname, "..", "..", "commands"), true);
    const contextMenuFolder = getFiles(path.join(__dirname, "..", "..", "context"));

    for (const folder of commandFolders) {
        const commandFiles = getFiles(folder);
        commandFiles.sort((a, b) => a > b);

        for (const file of commandFiles) {
            if (!file.endsWith(".js")) continue;
            const command = require(file);
            commands.set(command.name, {
                ...command,
                type: ApplicationCommandType.ChatInput
            });
        }
    }

    for (const file of contextMenuFolder) {
        if (!file.endsWith(".js")) continue;
        const command = require(file);
        commands.set(command.name, {
            ...command,
            description: null,
            type: command.type || ApplicationCommandType.Message,
        });
    }

    const rest = new REST().setToken(process.env.TOKEN);

    try {
        console.log("[Cm] • Registering commands", devMode ? `to dev guild` : "globally");

        const data = await rest.put(devMode ?
            Routes.applicationGuildCommands(client.user.id, devGuild) :
            Routes.applicationCommands(client.user.id),
            { body: commands.toJSON() }
        )

        console.log(`[Cm] • Registered ${data.length} commands`);
    } catch (e) {
        console.log("[Cm] • Failed to register commands", e);
    }
}