const { Client, Message } = require("discord.js");
const { getCommands } = require("../../../modules/utils");
const config = require("../../../configs/config");

/**
 * @param {Client} client 
 * @param {Message} message 
 */

module.exports = async ( /**@type {Client} */ client, message) => {
    if (!message.guild || message.author.bot) return;
    if (!message.content.startsWith(config.prefix)) return;

    const commands = getCommands();
    try {
        const commandName = message.content.split(config.prefix)[1].split(" ")[0].toLowerCase();
        const command = commands.find(c => c.name === commandName || c.aliases.includes(commandName));
        if (!command) return;

        if (command.devOnly && !config.devs.includes(message.author.id)) {
            return message.reply({
                content: "This command is only for developers only!",
            });
        };

        if (command.disabled) {
            return message.reply({
                content: "This command is currently disabled!",
            });
        };

        if (command.roleRequired && command.roleRequired !== false) {
            const rolesArray = command.roleRequired;
            const memberRoles = message.member.roles;
            if (rolesArray.length) {
                if (!memberRoles.cache.some(r => rolesArray.includes(r.name))) {
                    if (!memberRoles.cache.some(r => rolesArray.includes(r.id))) {
                        return message.reply({
                            content: "You are not allowed to use this command!",
                        });
                    }
                }
            }
        }

        if (command.channelOnly && command.channelOnly !== false) {
            const channelsArray = command.channelOnly;
            if (channelsArray.length) {
                if (!channelsArray.includes(message.channel.name)) {
                    if (!channelsArray.includes(message.channel.id)) {
                        return message.reply({
                            content: "You are not allowed to use this command in this channel!",
                        });
                    }
                }
            }
        }

        const args = message.content.split(" ")[1];
        command.runLegacy(client, message, args || []);
    } catch (e) {
        console.error(e);
        return message.reply({
            content: "There was an error while executing this command!",
        })
    }
}