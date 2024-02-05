const { ApplicationCommandOptionType, Client, CommandInteraction, EmbedBuilder, Message } = require("discord.js");
const { getDatabase } = require("../../modules/handlers/database");
const config = require("../../configs/config");

module.exports = {
    name: "kick",
    category: "Staff",
    description: "Kick a member",
    devOnly: false,
    disabled: false,
    channelOnly: [],
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

    /**
     * 
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     */

    runSlash: async (client, interaction) => {

        if (!config.createDbConnection) {
            return interaction.reply({
                content: "Database connection is not enabled",
                ephemeral: true,
            });
        }

        await interaction.deferReply({ ephemeral: true });

        const user = interaction.options.getUser("member");
        const reason = interaction.options.getString("reason");
        const member = await interaction.guild.members.fetch(user.id);

        if (!member) {
            return interaction.editReply("User not found in server");
        }

        if (!member.kickable) {
            return interaction.editReply("I can't kick the mentioned member");
        }

        const db = getDatabase("infractions");

        try {
            await member.send({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({
                            name: "Kicked",
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
        } catch (e) { }

        await member.kick();
        await db.create({
            guild: interaction.guild.id,
            user: user.id,
            moderator: interaction.user.id,
            action: "kick",
            reason: reason,
            active: false,
            given: interaction.createdTimestamp,
            expires: "-",
        })

        return interaction.editReply({
            content: "**Kicked** <@" + user.id + "> successfully",
        });
    },

    /**
     * 
     * @param {Client} client 
     * @param {Message} interaction 
     * @param {Array} args 
     */

    runLegacy: async (client, message, args) => {
    }
}