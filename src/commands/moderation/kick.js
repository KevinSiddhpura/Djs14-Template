const { ApplicationCommandOptionType, Client, CommandInteraction, EmbedBuilder } = require("discord.js");
const { getDatabase } = require("../../modules/handlers/database");

module.exports = {
    name: "kick",
    category: "Moderation",
    description: "Kick a member",
    devOnly: false,
    disabled: false,
    roleRequired: ["Mod"],
    options: [
        {
            type: ApplicationCommandOptionType.User,
            name: "member",
            description: "Mention the user to kick",
            required: true,
        },
        {
            type: ApplicationCommandOptionType.String,
            name: "reason",
            description: "Reason for the kick",
            required: true,
        }
    ],
    execute: async (/**@type {Client} */ client, /**@type {CommandInteraction} */ interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const user = interaction.options.getUser("member");
        const reason = interaction.options.getString("reason");
        const member = await interaction.guild.members.fetch(user.id);

        if (!member) {
            return interaction.editReply("User not found in server");
        }

        if(!member.kickable) {
            return interaction.editReply("I can't kick the mentioned member");
        }

        const db = getDatabase("infractions");
        const [data, exists] = await db.findOrCreate({
            where: {
                userId: user.id
            },
            defaults: {
                userId: user.id,
                history: JSON.stringify([]),
                currentMute: JSON.stringify([]),
                currentBan: JSON.stringify([]),
            }
        });

        await data.update({
            history: JSON.stringify([...JSON.parse(data.history), {
                action: "kick",
                member: user.id,
                moderator: interaction.user.id,
                reason: reason,
                timestamp: interaction.createdTimestamp
            }])
        });

        try {
            await member.send({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({
                            name: "Kicked",
                            iconURL: client.user.displayAvatarURL()
                        })
                        .setColor(Colors.Red)
                        .setThumbnail("https://cdn.discordapp.com/attachments/1162773061888659456/1187447426378891264/ham.gif?ex=6596eb98&is=65847698&hm=6bb84c96811cb47a95d4dd6ddf163762760819e5a8a8034e75947edc62e2647c&")
                        .setDescription([
                            `- **Moderator** • <@${interaction.user.id}>`,
                            `- **Reason** • ${reason}`,
                            `- **Timestamp** • <t:${(interaction.createdTimestamp / 1000).toFixed(0)}:R>`
                        ].join("\n"))
                        .setFooter({
                            text: interaction.guild.name,
                            iconURL: interaction.guild.iconURL()
                        })
                ]
            })
        } catch (e) {

        }

        await member.kick();
        await data.update({
            history: JSON.stringify([...JSON.parse(data.history), {
                action: "kick",
                member: user.id,
                moderator: interaction.user.id,
                reason: reason,
                timestamp: interaction.createdTimestamp
            }])
        });

        return interaction.editReply({
            content: "**Kicked** <@" + member.id + "> successfully",
        });
    }
}