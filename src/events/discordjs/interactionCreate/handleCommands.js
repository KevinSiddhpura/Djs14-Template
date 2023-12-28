const { Client, CommandInteraction } = require("discord.js");
const { getCommands } = require("../../../modules/utils");
const config = require("../../../../config");

/**
 * @param {Client} client 
 * @param {CommandInteraction} interaction 
 */

module.exports = ( /**@type {Client} */ client, interaction) => {
    if (!interaction.isCommand()) return;

    const commands = getCommands();
    try {
        const command = commands.find(c => c.name === interaction.commandName);
        if (!command) return;

        if (command.devOnly && !config.devs.includes(interaction.user.id)) {
            return interaction.reply({
                content: "This command is only for developers only!",
                ephemeral: true
            });
        };

        if (command.disabled) {
            return interaction.reply({
                content: "This command is currently disabled!",
                ephemeral: true
            });
        };

        if (command.roleRequired && command.roleRequired !== false) {
            const rolesArray = command.roleRequired;
            const memberRoles = interaction.member.roles;
            if(rolesArray.length) {
                if (!memberRoles.cache.some(r => rolesArray.includes(r.name))) {
                    if (!memberRoles.cache.some(r => rolesArray.includes(r.id))) {
                        return interaction.reply({
                            content: "You are not allowed to use this command!",
                            ephemeral: true
                        });
                    }
                }
            }
        }

        if (command.channelOnly && command.channelOnly !== false) {
            const channelsArray = command.channelOnly;
            if(channelsArray.length) {
                if (!channelsArray.includes(interaction.channel.name)) {
                    if (!channelsArray.includes(interaction.channel.id)) {
                        return interaction.reply({
                            content: "You are not allowed to use this command in this channel!",
                            ephemeral: true
                        });
                    }
                }
            }
        }

        command.execute(client, interaction);
    } catch (e) {
        console.error(e);
        return interaction.reply({
            content: "There was an error while executing this command!",
            ephemeral: true
        })
    }
}