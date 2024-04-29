const { Client, Message, PermissionFlagsBits } = require("discord.js");
const { commands } = require("../..");
const { devs, prefixes } = require("../../constants");
const { hasRole } = require("../../modules/utils");

/**
 * 
 * @param {Client} client 
 * @param {Message} message 
 */

module.exports = async (client, message) => {
    if (message.author.bot || !message.guild) return;

    let prefix = null;
    for (const _prefix of prefixes) {
        if (message.content.startsWith(_prefix.toLowerCase())) {
            prefix = _prefix;
            break;
        }
    }
    if (!prefix) return;

    const commandUsed = message.content.slice(prefix.length).split(/ +/).shift().toLowerCase();
    const command = commands.get(commandUsed) || commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandUsed));
    if (!command) return;

    try {
        if (command?.enabled === false) {
            await message.reply({ content: "This command is disabled" });
            return;
        }

        if (command?.devOnly) {
            if (!devs.includes(message.author.id)) {
                await message.reply({ content: "This command is only for developers" });
                return;
            }
        }

        if (command?.adminOnly) {
            if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
                if (devs.includes(message.author.id)) return;
                await message.reply({ content: "This command is only for admins" });
                return;
            }
        }

        if (command?.allowedRoles && command.allowedRoles.length > 0) {
            if(!devs.includes(message.author.id)) {
                const roleCheck = hasRole(command.allowedRoles, message.member);
                if (!roleCheck) {
                    await message.reply({ content: "You can not run this command" });
                    return;
                }
            }
        }

        if (command?.allowedChannels && command.allowedChannels.length > 0) {
            if (!command.allowedChannels.includes(message.channelId)) {
                await message.reply({ content: "You can not run this command in this channel" });
                return;
            }
        }

        const args = message.content.slice(prefix.length + commandUsed.length).trim().split(/ +/g) || [];
        await command.runLegacy(client, message, args);
        return;
    } catch (error) {
        console.log(error);
        await message.reply("There was an error while executing this command");
        return;
    }
}