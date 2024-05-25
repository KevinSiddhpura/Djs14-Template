const { Client, PermissionFlagsBits } = require("discord.js");
const { commandCollection, Command } = require("../../handlers/helpers/command");
const { devs } = require("../../config");
const logger = require("../../handlers/helpers/logger");
const { findChannel, findRole } = require("../../handlers/utils");

/**
 * 
 * @param {Command} command
 * @param {ChatInputCommandInteraction} interaction
 */

async function performChecks(command, interaction) {
    if (!command.enabled) {
        return interaction.reply({
            content: "This command is disabled.",
            ephemeral: true
        })
    };

    if (command.devOnly) {
        if (!devs.includes(interaction.user.id)) {
            return interaction.reply({
                content: "This command is only for developers.",
                ephemeral: true
            })
        }
    };

    if (command.adminOnly) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator) || !devs.includes(interaction.user.id)) {
            return interaction.reply({
                content: "This command is only for administrators.",
                ephemeral: true
            })
        }
    }

    if (command.allowedChannels.length > 0) {
        for (const channel of command.allowedChannels) {
            const _channel = findChannel(channel, interaction.guild);
            if (_channel.id == interaction.channelId) {
                return true;
            }
        }

        return interaction.reply({
            content: "This command can only be used in the following channels: " + command.allowedChannels.join(", "),
            ephemeral: true
        })
    }

    if (command.allowedRoles.length > 0) {
        for (const role of command.allowedRoles) {
            const _role = findRole(role, interaction.guild);
            if (interaction.member.roles.cache.has(_role.id)) {
                return true;
            }
        }

        return interaction.reply({
            content: "This command can only be used by the following roles: " + command.allowedRoles.join(", "),
            ephemeral: true
        })
    }

    return true;
}

module.exports = {
    /**
    * @param {Client} client
    * @param {ContextMenuCommandInteraction} interaction 
    */

    run: async (client, interaction) => {
        if (interaction.isChatInputCommand()) {
            /**@type {Command} */
            const command = commandCollection.get(interaction.commandName);
            if (!command) {
                return interaction.reply({
                    content: "The command does not exist or was not updated.",
                    ephemeral: true
                })
            };

            await performChecks(command, interaction).then(() => {
                command.runSlash(client, interaction);
            }).catch(error => logger.error(error));
        } else if (interaction.isUserContextMenuCommand()) {
            /**@type {Command} */
            const command = commandCollection.get(interaction.commandName);
            if (!command) {
                return interaction.reply({
                    content: "The command does not exist or was not updated.",
                    ephemeral: true
                })
            };

            await performChecks(command, interaction).then(() => {
                command.runContextUser(client, interaction);
            }).catch(error => logger.error(error));
        } else if (interaction.isMessageContextMenuCommand()) {
            /**@type {Command} */
            const command = commandCollection.get(interaction.commandName);
            if (!command) {
                return interaction.reply({
                    content: "The command does not exist or was not updated.",
                    ephemeral: true
                })
            };

            await performChecks(command, interaction).then(() => {
                command.runContextMessage(client, interaction);
            }).catch(error => logger.error(error));
        }
    }
}