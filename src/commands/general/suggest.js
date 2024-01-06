const { Client, CommandInteraction, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, EmbedBuilder, Colors } = require("discord.js");
const { getDatabase } = require("../../modules/handlers/database");
const logger = require("../../modules/logger");
const { getChannel } = require("../../modules/utils");
const config = require("../../configs/config");
const suggestionSystem = require("../../configs/suggestionSystem");

module.exports = {
    name: "suggest",
    category: "General",
    description: "Suggest something",
    devOnly: false,
    disabled: false,
    channelOnly: ["commands"],
    roleRequired: ["Members"],
    options: [],
    execute: async (/**@type {Client} */ client, /**@type {CommandInteraction} */ interaction) => {
        if (!suggestionSystem || !config.createDbConnection) {
            return interaction.reply({
                content: "Suggestion system is disabled or database connection is not created",
                ephemeral: true,
            });
        };

        const db = getDatabase("suggestions")

        const modal = new ModalBuilder()
            .setCustomId("suggestion-modal-" + interaction.id)
            .setTitle("Suggestion")
            .setComponents([
                new ActionRowBuilder()
                    .setComponents([
                        new TextInputBuilder()
                            .setCustomId("suggestion-input-" + interaction.id)
                            .setLabel("Text Field")
                            .setMaxLength(4000)
                            .setPlaceholder("Your suggestion here")
                            .setStyle(TextInputStyle.Paragraph)
                            .setRequired(true)
                    ])
            ]);

        await interaction.showModal(modal).catch(() => { });
        const resp = await interaction.awaitModalSubmit({ time: 3600000 }).catch(() => { });

        if (resp) {
            let suggestion = resp.fields.getTextInputValue("suggestion-input-" + interaction.id);
            suggestion = suggestion.replaceAll("`", "");

            const rows = [
                new ActionRowBuilder()
                    .setComponents([
                        new ButtonBuilder()
                            .setCustomId("suggestion-upvote")
                            .setEmoji("👍")
                            .setLabel("Likes • 0")
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId("suggestion-viewvoters")
                            .setEmoji("📃")
                            .setLabel("View Voters")
                            .setDisabled(suggestionSystem.showVoters ? false : true)
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId("suggestion-downvote")
                            .setEmoji("👎")
                            .setLabel("Dislikes • 0")
                            .setStyle(ButtonStyle.Danger),
                    ]),
                new ActionRowBuilder()
                    .setComponents([
                        new StringSelectMenuBuilder()
                            .setCustomId("suggestion-manage")
                            .setPlaceholder("Manage this suggestion")
                            .setOptions([{
                                label: "Accept Suggestion",
                                emoji: "✅",
                                value: "accept",
                            }, {
                                label: "Reject Suggestion",
                                emoji: "❌",
                                value: "reject",
                            }, {
                                label: "Put On Hold",
                                emoji: "⏲",
                                value: "hold",
                            }, {
                                label: "Reset Votes",
                                emoji: "🔄",
                                value: "reset",
                            }, {
                                label: "Delete Suggestion",
                                emoji: "🗑️",
                                value: "delete",
                            }])
                    ])
            ]

            const submitChannel = getChannel(suggestionSystem.channels.suggestion, interaction.guild);
            if (!submitChannel) {
                return resp.reply({
                    content: "Suggestion channel was not found",
                    ephemeral: true,
                });
            };

            await submitChannel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Aqua)
                        .setThumbnail(interaction.user.displayAvatarURL())
                        .setAuthor({
                            name: "Suggestion from " + interaction.user.username,
                            iconURL: client.user.displayAvatarURL()
                        })
                        .setDescription([
                            "```",
                            suggestion,
                            "```"
                        ].join("\n"))
                        .setFields([{
                            name: "Extra Info",
                            value: [
                                `- **Submitted by** • <@${interaction.user.id}> | \`${interaction.user.username}\``,
                                `- **Status** • Pending Review`,
                                `- **Reactions** • \` 0 \``,
                                `- **Submitted at** • <t:${(interaction.createdTimestamp / 1000).toFixed(0)}:f>`,
                            ].join("\n"),
                            inline: true,
                        }])
                ],
                components: [...rows]
            }).then(async (x) => {
                await db.create({
                    guild: interaction.guild.id,
                    user: interaction.user.id,
                    channel: submitChannel.id,
                    message: x.id,
                    suggestion: suggestion,
                    votedUsers: JSON.stringify([]),
                    upVotes: 0,
                    downVotes: 0,
                    status: "pending",
                    submitTime: interaction.createdTimestamp
                });

                return resp.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Colors.Aqua)
                            .setTitle("Suggestion Submitted")
                            .setFooter({
                                text: "Suggestion ID: " + x.id,
                                iconURL: client.user.displayAvatarURL()
                            })
                    ],
                    ephemeral: true,
                })
            }).catch(async (err) => {
                logger.error(err);
                return resp.reply({
                    content: "An error occured while submitting your suggestion",
                    ephemeral: true,
                });
            })
        }
    }
}