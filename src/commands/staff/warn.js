const { ApplicationCommandOptionType, Client, CommandInteraction, EmbedBuilder, Colors } = require("discord.js");
const { getDatabase } = require("../../modules/handlers/database");
const config = require("../../../config");

module.exports = {
    name: "warn",
    category: "Staff",
    description: "Warns a user",
    devOnly: false,
    disabled: false,
    channelOnly: [],
    roleRequired: ["Mod"],
    options: [
        {
            type: ApplicationCommandOptionType.User,
            name: "member",
            description: "Mention the user to warn",
            required: true,
        },
        {
            type: ApplicationCommandOptionType.String,
            name: "reason",
            description: "Reason for the warn",
            required: true,
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

        const member = interaction.options.getUser("member");
        const reason = interaction.options.getString("reason");

        const db = getDatabase("infractions");

        try {
            await member.send({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({
                            name: "Warned",
                            iconURL: client.user.displayAvatarURL()
                        })
                        .setColor(Colors.Red)
                        .setDescription([
                            `- **Moderator** • **\`${interaction.user.username}\`** | (${interaction.user.id})`,
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

        await db.create({
            guild: interaction.guild.id,
            user: member.id,
            moderator: interaction.user.id,
            action: "warn",
            reason: reason,
            active: false,
            expires: "-",
            given: interaction.createdTimestamp,
        });

        await interaction.editReply({
            content: "**Warned** <@" + member.id + "> successfully",
        });
    }
}