const { ApplicationCommandOptionType, Client, CommandInteraction, EmbedBuilder, Colors } = require("discord.js");
const ms = require("ms");
const { getDatabase } = require("../../modules/handlers/database");
const { getRole } = require("../../modules/utils");
const { config } = require("../..");

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
            choices: [
                // Same choices as in your ban command
            ],
            required: false,
        }
    ],
    execute: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const user = interaction.options.getUser("member");
        const reason = interaction.options.getString("reason") || "Not specified";
        const expires = interaction.options.getString("expires") || "permanent";

        const member = await interaction.guild.members.fetch(user.id);
        if (!member) {
            return interaction.editReply("User not found in server");
        };

        const _role = await getRole(config.mutedRole, interaction.guild);
        if(!_role) return interaction.editReply("Muted role not found");

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

        if(data.currentMute && data.currentMute.length > 0) return interaction.editReply("This user is already temp-muted");

        try {
            await member.roles.add(_role.id);
        } catch (e) {
            return interaction.editReply({
                content: "I can't mute the mentioned user",
            })
        }

        let exp = expires == "permanent" ? "It's Permanent" : `<t:${((ms(expires) + interaction.createdTimestamp) / 1000).toFixed(0)}:f>`;

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
                            `- **Moderator** • <@${interaction.user.id}>`,
                            `- **Reason** • ${reason}`,
                            `- **Expires** • ${exp}`,
                            `- **Timestamp** • <t:${(interaction.createdTimestamp / 1000).toFixed(0)}:R>`
                        ].join("\n"))
                ]
            })
        } catch (e) {}

        if (expires !== "permanent") {
            await data.update({
                history: JSON.stringify([...JSON.parse(data.history), {
                    action: "temp-mute",
                    member: member.id,
                    moderator: interaction.user.id,
                    reason: reason,
                    expires: expires,
                    timestamp: interaction.createdTimestamp
                }]),
                currentMute: JSON.stringify({
                    userId: member.id,
                    expires: ((interaction.createdTimestamp + (ms(expires)) / 1000).toFixed(0)),
                })
            });

            return interaction.editReply({
                content: "**Temporarily Muted** <@" + member.id + "> successfully",
            });
        } else {
            await data.update({
                history: JSON.stringify([...JSON.parse(data.history), {
                    action: "mute",
                    member: member.id,
                    moderator: interaction.user.id,
                    reason: reason,
                    expires: expires,
                    timestamp: interaction.createdTimestamp
                }])
            });

            return interaction.editReply({
                content: "**Muted** <@" + member.id + "> successfully",
            });
        }
    }
}
