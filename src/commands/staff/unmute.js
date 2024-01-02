const { ApplicationCommandOptionType, Client, CommandInteraction } = require("discord.js");
const { getDatabase } = require("../../modules/handlers/database");
const { getRole } = require("../../modules/utils");
const { Op } = require("sequelize");
const config = require("../../../config");

module.exports = {
    name: "unmute",
    category: "Staff",
    description: "Unmute a user",
    devOnly: false,
    disabled: false,
    channelOnly: [],
    roleRequired: ["Mod"],
    options: [
        {
            type: ApplicationCommandOptionType.User,
            name: "member",
            description: "Provide a member unmute",
            required: true,
        },
    ],
    execute: async (/**@type {Client} */ client, /**@type {CommandInteraction} */ interaction) => {

        if(!config.createDbConnection) {
            return interaction.reply({
                content: "Database connection is not enabled",
                ephemeral: true,
            });
        }

        await interaction.deferReply({ ephemeral: true });

        const user = interaction.options.getUser("member");
        const member = await interaction.guild.members.fetch(user.id);

        if (!member) {
            return interaction.editReply("User not found in server");
        };

        const role = await getRole(config.mutedRole, interaction.guild);
        if (!role) {
            return interaction.editReply("Muted role not found");
        }

        const db = getDatabase("infractions");

        const data = await db.findAll({
            where: {
                [Op.and]: [
                    {
                        user: user.id,
                        guild: interaction.guild.id
                    }
                ],
                action: {
                    [Op.or]: ["mute", "temp-mute"],
                },
                active: true
            },
        });

        if (data) {
            for (let i = 0; i < data.length; i++) {
                await db.update({
                    active: false
                }, {
                    where: {
                        infID: data[i].infID
                    }
                });
            }
        }

        try {
            await member.roles.remove(role.id);
        } catch (e) {

        }

        return interaction.editReply(`**Unmuted** <@${user.id}> successfully`);
    }
}