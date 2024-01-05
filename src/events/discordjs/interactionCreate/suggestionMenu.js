const { Client, StringSelectMenuInteraction, EmbedBuilder, Colors, ActionRow, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const config = require("../../../../config");
const { getDatabase } = require("../../../modules/handlers/database");
const { Op } = require("sequelize");
const { getChannel, updateSuggestionMessageVoteAction, hasRole } = require("../../../modules/utils");

/**
 * @param {Client} client 
 * @param {StringSelectMenuInteraction} interaction 
 */

module.exports = async ( /**@type {Client} */ client, interaction) => {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== "suggestion-manage") return;

    const db = getDatabase("suggestions");
    const value = interaction.values[0];

    const data = await db.findOne({
        where: {
            [Op.and]: [
                {
                    message: interaction.message.id,
                    guild: interaction.guild.id,
                }
            ]
        }
    });

    if (!data) {
        return interaction.reply({ content: "This suggestion was not found in database", ephemeral: true });
    };

    const acceptChannel = getChannel(config.suggestionSystem.channels.accepted, interaction.guild);
    if (!acceptChannel) {
        return interaction.reply({ content: "Accepted suggestions channel not found channel not found", ephemeral: true });
    };

    const rejectChannel = getChannel(config.suggestionSystem.channels.rejected, interaction.guild);
    if (!rejectChannel) {
        return interaction.reply({ content: "Rejected suggestions channel not found channel not found", ephemeral: true });
    };

    const holdChannel = getChannel(config.suggestionSystem.channels.pending, interaction.guild);
    if (!holdChannel) {
        return interaction.reply({ content: "On-Hold suggestions channel not found channel not found", ephemeral: true });
    };

    const accessRoles = config.suggestionSystem.manageAccess;
    const hasAccess = hasRole(accessRoles, interaction.member);

    const oldEmbed = interaction.message.embeds[0];
    const newEmbed = new EmbedBuilder()
        .setAuthor({
            name: oldEmbed.author.name,
            iconURL: oldEmbed.author.iconURL
        })
        .setThumbnail(oldEmbed.thumbnail.url)
        .setDescription(oldEmbed.description);

    const votedUsers = JSON.parse(data.votedUsers);
    const likes = votedUsers.filter(u => u.type === "upvote").length;
    const dislikes = votedUsers.filter(u => u.type === "downvote").length;
    const totalReactions = likes + dislikes;

    const getRows = (disabled = false) => {
        return [
            new ActionRowBuilder()
                .setComponents([
                    new ButtonBuilder()
                        .setCustomId("suggestion-upvote")
                        .setLabel("Likes • " + likes)
                        .setStyle(ButtonStyle.Success)
                        .setDisabled(disabled),
                    new ButtonBuilder()
                        .setCustomId("suggestion-viewvoters")
                        .setLabel("View Voters")
                        .setEmoji("📃")
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(disabled),
                    new ButtonBuilder()
                        .setCustomId("suggestion-downvote")
                        .setLabel("Dislikes • " + dislikes)
                        .setStyle(ButtonStyle.Danger)
                        .setDisabled(disabled),
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
    };

    const modal = new ModalBuilder()
        .setCustomId("reason-modal-suggestion-" + interaction.id)
        .setTitle("Reason for action")
        .setComponents([
            new ActionRowBuilder()
                .setComponents([
                    new TextInputBuilder()
                        .setCustomId("reason-input-" + interaction.id)
                        .setLabel("Reason")
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(false)
                        .setPlaceholder("Just provides extra information")
                ])
        ])

    switch (value) {
        case "accept": {
            if(!hasAccess) {
                return interaction.reply({ content: "You don't have access to this action", ephemeral: true });
            }

            newEmbed.setColor(Colors.Green);
            await interaction.showModal(modal).catch(() => { });
            const filter = i => i.customId === "reason-modal-suggestion-" + interaction.id;
            const resp = await interaction.awaitModalSubmit({ time: 3600000, filter }).catch(() => { });
            if (!resp) return {};
            const reason = resp.fields.getTextInputValue("reason-input-" + interaction.id) || "No reason provided";

            newEmbed.setFields([{
                name: "Extra Info",
                value: [
                    `- **Submitted By** • <@${data.user}> | \`${data.user}\``,
                    `- **Status** • Accepted`,
                    `- **Reactions** • \`${totalReactions}\``,
                    `- **Submitted at** • <t:${(data.submitTime / 1000).toFixed(0)}:f>`,
                ].join("\n"),
            }, {
                name: "Reason for accepting",
                value: `> ${reason}`
            }]);

            await acceptChannel.send({
                embeds: [newEmbed],
                components: getRows(true)
            }).then(async (x) => {
                await data.update({
                    status: "accepted",
                    message: x.id
                });
            });

            resp.reply({ content: "Suggestion Accepted", ephemeral: true });
            interaction.message.delete().catch(() => { });

            break;
        }

        case "reject": {
            if(!hasAccess) {
                return interaction.reply({ content: "You don't have access to this action", ephemeral: true });
            }

            newEmbed.setColor(Colors.Red);
            await interaction.showModal(modal).catch(() => { });
            const filter = i => i.customId === "reason-modal-suggestion-" + interaction.id;
            const resp = await interaction.awaitModalSubmit({ time: 3600000, filter }).catch(() => { });
            if (!resp) return {};
            const reason = resp.fields.getTextInputValue("reason-input-" + interaction.id) || "No reason provided";

            newEmbed.setFields([{
                name: "Extra Info",
                value: [
                    `- **Submitted By** • <@${data.user}> | \`${data.user}\``,
                    `- **Status** • Rejected`,
                    `- **Reactions** • \`${totalReactions}\``,
                    `- **Submitted at** • <t:${(data.submitTime / 1000).toFixed(0)}:f>`,
                ].join("\n"),
            }, {
                name: "Reason for rejecting",
                value: `> ${reason}`
            }]);

            await rejectChannel.send({
                embeds: [newEmbed],
                components: getRows(true)
            }).then(async (x) => {
                await data.update({
                    status: "rejected",
                    message: x.id
                });
            });

            resp.reply({ content: "Suggestion Rejected", ephemeral: true });
            interaction.message.delete().catch(() => { });
            break;
        }

        case "hold": {
            if(!hasAccess) {
                return interaction.reply({ content: "You don't have access to this action", ephemeral: true });
            }

            newEmbed.setColor(Colors.Yellow);
            await interaction.showModal(modal).catch(() => { });
            const filter = i => i.customId === "reason-modal-suggestion-" + interaction.id;
            const resp = await interaction.awaitModalSubmit({ time: 3600000, filter }).catch(() => { });
            if (!resp) return {};
            const reason = resp.fields.getTextInputValue("reason-input-" + interaction.id) || "No reason provided";

            newEmbed.setFields([{
                name: "Extra Info",
                value: [
                    `- **Submitted By** • <@${data.user}> | \`${data.user}\``,
                    `- **Status** • On Hold`,
                    `- **Reactions** • \`${totalReactions}\``,
                    `- **Submitted at** • <t:${(data.submitTime / 1000).toFixed(0)}:f>`,
                ].join("\n"),
            }, {
                name: "Reason for putting on-hold",
                value: `> ${reason}`
            }]);

            await holdChannel.send({
                embeds: [newEmbed],
                components: getRows(false)
            }).then(async (x) => {
                await data.update({
                    status: "pending",
                    message: x.id
                });
            });

            resp.reply({ content: "Suggestion is on hold", ephemeral: true });
            interaction.message.delete().catch(() => { });
            break;
        }

        case "reset": {
            if(!hasAccess) {
                return interaction.reply({ content: "You don't have access to this action", ephemeral: true });
            }

            await data.update({
                votedUsers: JSON.stringify([]),
                upVotes: 0,
                downVotes: 0
            });

            const updatedData = await db.findOne({
                where: {
                    index: data.index
                }
            });

            updateSuggestionMessageVoteAction(updatedData, interaction);
            interaction.reply({ content: "Votes reset complete", ephemeral: true });
            break;
        }

        case "delete": {
            if(!hasAccess || interaction.user.id !== data.user) {
                return interaction.reply({ content: "You don't have access to this action", ephemeral: true });
            };

            await interaction.deferUpdate().catch(() => {});

            await data.destroy();
            await interaction.message.delete().catch(() => { });
            break;
        }
    }
}