const { ApplicationCommandOptionType, Client, CommandInteraction, EmbedBuilder, Colors } = require("discord.js");
const { getDatabase } = require("../../modules/handlers/database");

module.exports = {
    name: "warn",
    category: "Moderation",
    description: "Warn a user",
    devOnly: false,
    disabled: false,
    roleRequired: ["Mod"],
    options: [
        {
            type: ApplicationCommandOptionType.User,
            name: "user",
            description: "User to send warning to",
            required: true,
        },
        {
            type: ApplicationCommandOptionType.String,
            name: "message",
            description: "Message to be sent",
            required: true,
        }
    ],
    execute: async (/**@type {Client} */ client, /**@type {CommandInteraction} */ interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const user = interaction.options.getUser("user");
        const message = interaction.options.getString("message");

        const db1 = getDatabase("moderation");
        const db2 = getDatabase("moderationHistory");

        const data_overAll = await db1.findOrCreate({
            where: {
                guildId: interaction.guildId,
                userId: user.id,
            },
            defaults: {
                guildId: interaction.guildId,
                userId: user.id,
                overAll: 0,
            }
        });

        const data_history = await db2.findOrCreate({
            where: {
                guildId: interaction.guildId,
                userId: user.id
            },
            defaults: {
                guildId: interaction.guildId,
                userId: user.id,
                tempBans: 0,
                bans: 0,
                mutes: 0,
                tempMutes: 0,
                warnings: 0,
                history: JSON.stringify([]),
            }
        });

        const member = await interaction.guild.members.fetch(user.id);
        if (member) {
            try {
                await member.send({
                    embeds: [
                        new EmbedBuilder()
                            .setAuthor({
                                name: "Moderation",
                                iconURL: client.user.displayAvatarURL()
                            })
                            .setColor(Colors.Red)
                            .setDescription([
                                "- **Action:** Warn",
                                `- **Moderator:** <@${interaction.user.id}>`,
                                `- **Reason**: ${message}`,
                            ].join("\n"))
                            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
                            .setThumbnail("https://media1.tenor.com/m/NF84so0XFSEAAAAC/hololive-hologra.gif")
                            .setTimestamp(Date.now())
                    ]
                });
            } catch (e) {

            }

            await data_overAll[0].update({
                overAll: data_overAll[0].overAll + 1
            })

            const _history = {
                guild: interaction.guild.id,
                action: "warn",
                moderator: interaction.user.id,
                member: user.id,
                timed: false,
                message,
                timeStamp: interaction.createdTimestamp,
            };

            await data_history[0].update({
                warnings: data_history[0].warnings + 1,
                history: JSON.stringify([...JSON.parse(data_history[0].history), _history]),
            });

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Gold)
                        .setDescription(`**Action** on <@${user.id}>, has been warned **successfully**`)
                ]
            })
        }
    }
}