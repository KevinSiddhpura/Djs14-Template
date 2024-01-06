const { ApplicationCommandOptionType, Client, CommandInteraction, Colors, EmbedBuilder } = require("discord.js");
const ms = require("ms");
const { getDatabase } = require("../../modules/handlers/database");
const { Op } = require("sequelize");
const config = require("../../configs/config");

module.exports = {
    name: "ban",
    category: "Staff",
    description: "Ban a user",
    devOnly: false,
    disabled: false,
    channelOnly: [],
    roleRequired: ["Admin"],
    options: [
        {
            type: ApplicationCommandOptionType.User,
            name: "member",
            description: "Mention the user to ban",
            required: true,
        },
        {
            type: ApplicationCommandOptionType.String,
            name: "reason",
            description: "Reason for the ban",
            required: false,
        },
        {
            type: ApplicationCommandOptionType.String,
            name: "expires",
            description: "Select time to expire the ban",
            choices: [{
                name: "1 hour",
                value: "1h",
            }, {
                name: "6 hours",
                value: "6h",
            }, {
                name: "12 hours",
                value: "12h",
            }, {
                name: "1 day",
                value: "1d",
            }, {
                name: "3 days",
                value: "3d",
            }, {
                name: "1 week",
                value: "7d",
            }, {
                name: "3 weeks",
                value: "21d",
            }, {
                name: "1 month",
                value: "30d",
            }],
            required: false,
        }
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
        const reason = interaction.options.getString("reason") || "Not specified";
        const expires = interaction.options.getString("expires") || "permanent";

        const member = await interaction.guild.members.fetch(user.id);
        if (!member) {
            return interaction.editReply("User not found in server");
        };

        if (!member.bannable) {
            return interaction.editReply("I can't ban the mentioned member");
        };

        const db = getDatabase("infractions");

        const user_data = await db.findAll({
            where: {
                [Op.and]: [
                    {
                        user: user.id,
                        guild: interaction.guild.id
                    }
                ],
                action: {
                    [Op.or]: ["ban", "temp-ban"],
                },
                active: true
            }
        });

        if (user_data.length > 0) return interaction.editReply("User is already banned");

        try {
            await member.send({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({
                            name: expires == "permanent" ? "Permanently Banned" : "Temp-Banned",
                            iconURL: client.user.displayAvatarURL()
                        })
                        .setColor(Colors.Red)
                        .setDescription([
                            `- **Moderator** • **\`${interaction.user.username}\`** | (${interaction.user.id})`,
                            `- **Reason** • ${reason}`,
                            `- **Expires** • ${expires == "permanent" ? "It's Permanent" : `<t:${((ms(expires) + interaction.createdTimestamp) / 1000).toFixed(0)}:f>`}`,
                            `- **Timestamp** • <t:${(interaction.createdTimestamp / 1000).toFixed(0)}:R>`
                        ].join("\n"))
                        .setFooter({
                            text: interaction.guild.name,
                            iconURL: interaction.guild.iconURL()
                        })
                ]
            })
        } catch (e) {}

        if (expires !== "permanent") {
            await db.create({
                guild: interaction.guild.id,
                user: user.id,
                moderator: interaction.user.id,
                action: "temp-ban",
                reason: reason,
                given: interaction.createdTimestamp,
                expires: (ms(expires) + interaction.createdTimestamp),
            })

            await member.ban();

            return interaction.editReply({
                content: "**Temp-Banned** <@" + user.id + "> successfully",
            });
        } else {
            await db.create({
                guild: interaction.guild.id,
                user: user.id,
                moderator: interaction.user.id,
                action: "ban",
                reason: reason,
                given: interaction.createdTimestamp,
                expires: "permanent",
            })

            await member.ban();

            return interaction.editReply({
                content: "**Banned** <@" + user.id + "> successfully",
            });
        }
    }
}