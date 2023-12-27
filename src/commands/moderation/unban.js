const { ApplicationCommandOptionType, Client, CommandInteraction } = require("discord.js");
const { getDatabase } = require("../../modules/handlers/database");
const { Op } = require("sequelize");
const config = require("../../../config");

module.exports = {
    name: "unban",
    category: "Moderation",
    description: "Unban a user",
    devOnly: false,
    disabled: false,
    roleRequired: ["Admin"],
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: "user",
            description: "Provide a user id to unban",
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

        const userId = interaction.options.getString("user");
        const db = getDatabase("infractions");
        const bannedUsers = await interaction.guild.bans.fetch();

        const data = await db.findAll({
            where: {
                user: userId,
                action: {
                    [Op.or]: ["ban", "temp-ban"],
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

        if (!bannedUsers.has(userId)) {
            return interaction.editReply("User is not banned");
        } else {
            await interaction.guild.bans.remove(userId);
            return interaction.editReply("User has been unbanned");
        };
    }
}