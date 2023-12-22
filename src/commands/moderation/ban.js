const { ApplicationCommandOptionType, Client, CommandInteraction, Colors, EmbedBuilder } = require("discord.js");
const ms = require("ms");
const { getDatabase } = require("../../modules/handlers/database");

module.exports = {
    name: "ban",
    category: "Moderation",
    description: "Ban a user",
    devOnly: false,
    disabled: false,
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

        const [data, exists] = await db.findOrCreate({
            where: {
                userId: member.id
            },
            defaults: {
                userId: member.id,
                history: JSON.stringify([]),
                currentMute: JSON.stringify([]),
                currentBan: JSON.stringify([]),
            }
        });

        if(data.currentBan && data.currentBan.length > 0) return interaction.editReply("This user is already temp-banned");

        let exp = expires == "permanent" ? "It's Permanent" : `<t:${((ms(expires) + interaction.createdTimestamp) / 1000).toFixed(0)}:f>`;

        try {
            await member.send({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({
                            name: expires == "permanent" ? "Permanently Banned" : "Temp-Banned",
                            iconURL: client.user.displayAvatarURL()
                        })
                        .setColor(Colors.Red)
                        .setThumbnail("https://cdn.discordapp.com/attachments/1162773061888659456/1187447426378891264/ham.gif?ex=6596eb98&is=65847698&hm=6bb84c96811cb47a95d4dd6ddf163762760819e5a8a8034e75947edc62e2647c&")
                        .setDescription([
                            `- **Moderator** • <@${interaction.user.id}>`,
                            `- **Reason** • ${reason}`,
                            `- **Expires** • ${exp}`,
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
            await data.update({
                history: JSON.stringify([...JSON.parse(data.history), {
                    action: expires == "permanent" ? "ban" : "temp-ban",
                    member: member.id,
                    moderator: interaction.user.id,
                    reason: reason,
                    expires: expires,
                    timestamp: interaction.createdTimestamp
                }]),
                currentBan: JSON.stringify({
                    userId: member.id,
                    expires: ((interaction.createdTimestamp + (ms(expires)) / 1000).toFixed(0)),
                })
            });

            await member.ban({ reason });

            return interaction.editReply({
                content: "**Temp-Banned** <@" + member.id + "> successfully",
            });
        } else {
            await data.update({
                history: JSON.stringify([...JSON.parse(data.history), {
                    action: "ban",
                    member: member.id,
                    moderator: interaction.user.id,
                    reason: reason,
                    expires: expires,
                    timestamp: interaction.createdTimestamp
                }])
            });

            await member.ban({ reason });

            return interaction.editReply({
                content: "**Banned** <@" + member.id + "> successfully",
            });
        }
    }
}