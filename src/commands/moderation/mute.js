const { ApplicationCommandOptionType, Client, CommandInteraction, EmbedBuilder, Colors } = require("discord.js");
const ms = require("ms");
const { getDatabase } = require("../../modules/handlers/database");
const { getRole } = require("../../modules/utils");
const { Op } = require("sequelize");
const config = require("../../../config");

module.exports = {
    name: "mute",
    category: "Moderation",
    description: "Mute a user",
    devOnly: false,
    disabled: false,
    roleRequired: ["Mod"],
    options: [
        {
            type: ApplicationCommandOptionType.User,
            name: "member",
            description: "Mention the user to mute",
            required: true,
        },
        {
            type: ApplicationCommandOptionType.String,
            name: "reason",
            description: "Reason for the mute",
            required: false,
        },
        {
            type: ApplicationCommandOptionType.String,
            name: "expires",
            description: "Select time to expire the mute",
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
    execute: async (client, interaction) => {

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

        const _role = await getRole(config.mutedRole, interaction.guild);
        if (!_role) return interaction.editReply("Muted role not found");

        const db = getDatabase("infractions");

        const user_data = await db.findAll({
            where: {
                user: user.id,
                action: {
                    [Op.or]: ["mute", "temp-mute"],
                },
                active: true
            }
        });

        if (user_data.length > 0) return interaction.editReply("User is already muted");

        try {
            await member.roles.add(_role.id);
        } catch (e) {
            return interaction.editReply({
                content: "I can't mute the mentioned user",
            })
        }

        try {
            await member.send({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({
                            name: expires == "permanent" ? "Permanently Muted" : "Temporarily Muted",
                            iconURL: client.user.displayAvatarURL()
                        })
                        .setColor(Colors.Red)
                        .setDescription([
                            `- **Moderator** • **\`${interaction.user.username}\`** | (${interaction.user.id})`,
                            `- **Reason** • ${reason}`,
                            `- **Expires** • ${expires == "permanent" ? "It's Permanent" : `<t:${((ms(expires) + interaction.createdTimestamp) / 1000).toFixed(0)}:f>`}`,
                            `- **Timestamp** • <t:${(interaction.createdTimestamp / 1000).toFixed(0)}:R>`
                        ].join("\n"))
                ]
            })
        } catch (e) { }

        if (expires !== "permanent") {
            await db.create({
                user: user.id,
                moderator: interaction.user.id,
                action: "temp-mute",
                reason: reason,
                active: true,
                given: interaction.createdTimestamp,
                expires: (interaction.createdTimestamp + ms(expires))
            })
            return interaction.editReply({
                content: "**Temporarily Muted** <@" + user.id + "> successfully",
            });
        } else {
            await db.create({
                user: user.id,
                moderator: interaction.user.id,
                action: "mute",
                reason: reason,
                active: true,
                given: interaction.createdTimestamp,
                expires: "permanent"
            })
            return interaction.editReply({
                content: "**Muted** <@" + user.id + "> successfully",
            });
        }
    }
}
