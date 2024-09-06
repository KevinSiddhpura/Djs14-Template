const path = require("path");
const fs = require("fs");
const { REST, Routes } = require("discord.js");
const { commandCollection } = require("./helpers/command");
const logger = require("./helpers/logger");
const { dev_guild } = require("../config");
const { default: axios } = require("axios");

module.exports = {
    wait: (time) => new Promise(resolve => setTimeout(resolve, ms(time))),

    paste: (data, site = "https://paste.kwin.in") => {
        return new Promise((resolve, reject) => {
            if (!data) {
                reject(new Error("No data provided"));
                return;
            }

            axios.post(`${site}/documents`, data)
                .then(res => {
                    const json = res.data;
                    if (!json || !json.key) {
                        reject(new Error("Invalid response from paste site"));
                    }

                    resolve(`${site}/${json.key}`);
                })
        })
    },

    getFiles: (dir, foldersOnly = false) => {
        const found = [];

        const files = fs.readdirSync(dir, {
            withFileTypes: true
        });

        for (const file of files) {
            const filePath = path.join(dir, file.name);

            if (foldersOnly) {
                if (file.isDirectory()) found.push(filePath);
            } else {
                if (file.isFile()) found.push(filePath);
            }
        }

        return found;
    },

    requireCommands: () => {
        const chatInputFolders = module.exports.getFiles(path.join(__dirname, "../commands/chatInput"), true);
        const contextFolders = module.exports.getFiles(path.join(__dirname, "../commands/context"), true);

        for (const commandFolder of chatInputFolders) {
            const commands = module.exports.getFiles(commandFolder);
            for (const command of commands) {
                if (!command.endsWith(".js")) continue;
                require(command);
            }
        }

        for (const commandFolder of contextFolders) {
            const commands = module.exports.getFiles(commandFolder);
            for (const command of commands) {
                if (!command.endsWith(".js")) continue;
                require(command);
            }
        }

        return true;
    },

    registerCommands: async (client, token) => {
        const rest = new REST({ version: "10" }).setToken(token);
        const commands = commandCollection.toJSON();

        try {
            logger.debug(`Started refreshing ${process.env.TYPE == "dev" ? "dev" : "prod"} application (/) commands.`);

            const data = await rest.put(process.env.TYPE == "dev" ? Routes.applicationGuildCommands(client.user.id, dev_guild) : Routes.applicationCommands(client.user.id), {
                body: process.argv.includes("--reset-cmds") ? {} : commands
            });

            logger.info(`Successfully reloaded ${data.length} ${process.env.TYPE == "dev" ? "dev" : "prod"} commands.`);
        } catch (error) {
            logger.error(error);
        }
    },

    reloadConfig: async () => {
        try {
            delete require.cache[require.resolve("../config")];
            require("../config");
            logger.debug("Reloaded config");   
            return true;
        } catch (error) {
            logger.error(error);
            return false;
        }
    },

    reloadEvents: async () => {
        const eventFolders = module.exports.getFiles(path.join(__dirname, "../events"), true);

        for (const folder of eventFolders) {
            const files = module.exports.getFiles(folder);
            for (const file of files) {
                if (!file.endsWith(".js")) continue;
                try {
                    delete require.cache[require.resolve(file)];
                    require(file);
                    logger.debug(`Reloaded ${file}`);
                } catch (error) {
                    logger.error(error);
                }
            }
        }

        return true;
    },

    reloadCommands: async () => {
        commandCollection.clear();

        let deleted = 0;

        const commandFolders = {
            chatInput: module.exports.getFiles(path.join(__dirname, "../commands/chatInput"), true),
            context: module.exports.getFiles(path.join(__dirname, "../commands/context"), true),
        };

        for (const folders of Object.values(commandFolders)) {
            for (const folder of folders) {
                const files = module.exports.getFiles(folder);
                for (const file of files) {
                    if (!file.endsWith(".js")) continue;
                    try {
                        delete require.cache[require.resolve(file)];
                        ++deleted;
                        logger.debug(`Reloaded ${file}`);
                    } catch (error) {
                        logger.error(error);
                    }
                }
            }
        };

        module.exports.requireCommands();
        setTimeout(() => {
            if (deleted == commandCollection.size) {
                logger.debug("Reloaded commands");
                return true;
            } else {
                logger.error("Failed to reload certain command(s), check logs.");
                return false;
            }
        }, 2000);
    },

    findChannel: (input, guild) => {
        return guild.channels.cache.find(channel => channel.name == input || channel.id == input);
    },

    findRole: (input, guild) => {
        return guild.roles.cache.find(role => role.name == input || role.id == input);
    },

    findChannels: (input, guild) => {
        return guild.channels.cache.filter(channel => channel.name == input || channel.id == input);
    },

    findRoles: (input, guild) => {
        return guild.roles.cache.filter(role => role.name == input || role.id == input);
    },

    addSpace: (string, number, inFront = true) => {
        if (inFront) {
            return string + new Array(number).fill("\u200b ").join("");
        } else {
            return new Array(number).fill("\u200b ").join("") + string;
        }
    },

    capitalize: (string, allWords = false) => {
        if (allWords) {
            return string.split(" ").map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)

            ).join(" ");
        } else {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }
    },

    splitArray: (array, perArray) => {
        const arrays = [];
        const maxArrays = Math.ceil(array.length / perArray);

        for (let i = 0; i < maxArrays; i++) {
            arrays.push(array.slice((i * perArray), (i * perArray) + perArray))
        }

        return arrays
    }
}