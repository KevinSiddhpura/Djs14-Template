const { Client, ContextMenuCommandInteraction } = require("discord.js");
const { commands } = require("../..");
const { hasRole } = require("../../modules/utils");
const { devs } = require("../../constants");

/**
 * 
 * @param {Client} client 
 * @param {ContextMenuCommandInteraction} interaction 
 */

module.exports = async (client, interaction) => {
    try {
        if (!interaction.isContextMenuCommand()) return;

        const command = commands.get(interaction.commandName);
        if (!command) {
            await interaction.reply({ content: "This command was not found, or is not updated", ephemeral: true });
            return;
        }

        if (command?.enabled === false) {
            await interaction.reply({ content: "This command is disabled", ephemeral: true });
            return;
        }

        if (command?.devOnly) {
            if (!devs.includes(interaction.user.id)) {
                await interaction.reply({ content: "This command is only for developers", ephemeral: true });
                return;
            }
        }

        if (command?.adminOnly) {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                if (devs.includes(interaction.user.id)) return;
                await interaction.reply({ content: "This command is only for admins", ephemeral: true });
                return;
            }
        }

        if (command?.allowedRoles && command.allowedRoles.length > 0) {
            if(!devs.includes(interaction.user.id)) {
                const roleCheck = hasRole(command.allowedRoles, interaction.member);
                if (!roleCheck) {
                    await interaction.reply({ content: "You can not run this command", ephemeral: true });
                    return;
                }
            }
        }

        if (command?.allowedChannels && command.allowedChannels.length > 0) {
            if (!command.allowedChannels.includes(interaction.channelId)) {
                await interaction.reply({ content: "You can not run this command in this channel", ephemeral: true });
                return;
            }
        }

        await command.runContext(client, interaction);
        return;
    } catch (error) {
        console.log(error);

        if (interaction.deferred) {
            await interaction.editReply({ content: "There was an error while executing this command", ephemeral: true });
            return;
        } else {
            await interaction.reply({ content: "There was an error while executing this command", ephemeral: true });
            return;
        }
    }
}