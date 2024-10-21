const path = require("path");
const fs = require("fs");
const { REST, Routes } = require("discord.js");
const logger = require("./helpers/logger");
const { dev_guild } = require("../config");
const axios = require("axios");
const { commandsCollection, getCommands } = require("./helpers/command");

/**
 * A utility class containing various helper functions for common tasks.
 */
class Utils {

    /**
     * Waits for a specified amount of time before resolving.
     * @param {number} time - Time to wait in milliseconds.
     * @returns {Promise<void>}
     */
    static wait(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }

    /**
     * Uploads the provided data to a paste site and returns the link.
     * @param {string} data - The data to upload.
     * @param {string} [site="https://paste.kwin.in"] - The paste site URL.
     * @returns {Promise<string>} - The URL of the paste.
     */
    static async paste(data, site = "https://paste.kwin.in") {
        if (!data) throw new Error("No data provided");

        try {
            const res = await axios.post(`${site}/documents`, { content: data });
            if (!res.data || !res.data.key) throw new Error("Invalid response from paste site");
            return `${site}/${res.data.key}`;
        } catch (error) {
            throw new Error(`Failed to paste data: ${error.message}`);
        }
    }

    /**
     * Retrieves files or folders from the specified directory.
     * @param {string} dir - The directory path.
     * @param {boolean} [foldersOnly=false] - Whether to retrieve only folders.
     * @returns {string[]} - An array of file or folder paths.
     */
    static getFiles(dir, foldersOnly = false) {
        return fs.readdirSync(dir, { withFileTypes: true })
            .filter(file => foldersOnly ? file.isDirectory() : file.isFile())
            .map(file => path.join(dir, file.name));
    }

    /**
     * Loads and requires all command files.
     * @returns {boolean} - True if successful.
     */
    static requireCommands() {
        const chatInputFolders = Utils.getFiles(path.join(__dirname, "../commands/chatInput"), true);
        const contextFolders = Utils.getFiles(path.join(__dirname, "../commands/context"), true);

        [...chatInputFolders, ...contextFolders].forEach(folder => {
            Utils.getFiles(folder).forEach(file => {
                if (file.endsWith(".js")) require(file);
            });
        });

        return true;
    }

    /**
     * Registers application commands with Discord's API.
     * @param {Client} client - The Discord client.
     * @param {string} token - The bot token.
     * @returns {Promise<void>}
     */
    static registerCommands(client) {
        new Promise(async (res, rej) => {
            const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
            const commands = getCommands();

            try {
                logger.debug(`Attempting to refresh commands`);
                const route = process.env.TYPE === "dev"
                    ? Routes.applicationGuildCommands(client.user.id, dev_guild)
                    : Routes.applicationCommands(client.user.id);

                const data = await rest.put(route, { body: process.argv.includes("--reset-cmds") ? [] : commands });
                logger.info(`Successfully reloaded ${data.length} commands`);
                res(true);
            } catch (error) {
                logger.error(`Failed to register commands: ${error}`);
                rej(false)
            }
        })
    }

    /**
     * Reloads the configuration file.
     * @returns {Promise<boolean>} - True if reloaded successfully, false otherwise.
     */
    static async reloadConfig() {
        try {
            delete require.cache[require.resolve("../config")];
            require("../config");
            logger.debug("Reloaded config");
            return true;
        } catch (error) {
            logger.error(`Failed to reload config: ${error.message}`);
            return false;
        }
    }

    /**
     * Reloads all event files.
     * @returns {Promise<boolean>} - True if successful, false otherwise.
     */
    static async reloadEvents() {
        const eventFolders = Utils.getFiles(path.join(__dirname, "../events"), true);

        for (const folder of eventFolders) {
            const files = Utils.getFiles(folder);
            for (const file of files) {
                if (file.endsWith(".js")) {
                    try {
                        delete require.cache[require.resolve(file)];
                        require(file);
                        logger.debug(`Reloaded ${file}`);
                    } catch (error) {
                        logger.error(`Failed to reload event ${file}: ${error.message}`);
                    }
                }
            }
        }
        return true;
    }

    /**
     * Reloads all commands and clears the command collection.
     * @returns {Promise<boolean>} - True if successful, false otherwise.
     */
    static async reloadCommands() {
        commandCollection.clear();
        let deleted = 0;

        const commandFolders = {
            chatInput: Utils.getFiles(path.join(__dirname, "../commands/chatInput"), true),
            context: Utils.getFiles(path.join(__dirname, "../commands/context"), true),
        };

        for (const folders of Object.values(commandFolders)) {
            for (const folder of folders) {
                const files = Utils.getFiles(folder);
                for (const file of files) {
                    if (file.endsWith(".js")) {
                        try {
                            delete require.cache[require.resolve(file)];
                            deleted++;
                            logger.debug(`Reloaded ${file}`);
                        } catch (error) {
                            logger.error(`Failed to reload command ${file}: ${error.message}`);
                        }
                    }
                }
            }
        }

        Utils.requireCommands();

        return new Promise(resolve => {
            setTimeout(() => {
                if (deleted === commandCollection.size) {
                    logger.debug("Reloaded commands successfully");
                    resolve(true);
                } else {
                    logger.error("Failed to reload certain commands");
                    resolve(false);
                }
            }, 2000);
        });
    }

    /**
     * Finds a channel in the guild by name or ID.
     * @param {string} input - The channel name or ID.
     * @param {Guild} guild - The Discord guild.
     * @returns {Channel|null} - The found channel, or null if not found.
     */
    static findChannel(input, guild) {
        return guild.channels.cache.find(channel => channel.name === input || channel.id === input);
    }

    /**
     * Finds a role in the guild by name or ID.
     * @param {string} input - The role name or ID.
     * @param {Guild} guild - The Discord guild.
     * @returns {Role|null} - The found role, or null if not found.
     */
    static findRole(input, guild) {
        return guild.roles.cache.find(role => role.name === input || role.id === input);
    }

    /**
     * Capitalizes the first letter of a string or every word in a string.
     * @param {string} string - The string to capitalize.
     * @param {boolean} [allWords=false] - Whether to capitalize every word.
     * @returns {string} - The capitalized string.
     */
    static capitalize(string, allWords = false) {
        return allWords
            ? string.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
            : string.charAt(0).toUpperCase() + string.slice(1);
    }

    /**
     * Splits an array into smaller arrays.
     * @param {Array} array - The array to split.
     * @param {number} perArray - The number of items per smaller array.
     * @returns {Array[]} - An array of smaller arrays.
     */
    static splitArray(array, perArray) {
        const arrays = [];
        for (let i = 0; i < Math.ceil(array.length / perArray); i++) {
            arrays.push(array.slice(i * perArray, (i + 1) * perArray));
        }
        return arrays;
    }
}

module.exports = Utils;