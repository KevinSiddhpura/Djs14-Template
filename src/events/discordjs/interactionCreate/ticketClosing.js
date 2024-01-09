const { Client, ButtonInteraction, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder, Colors } = require("discord.js");
const { Op } = require("sequelize");
const { hasRole, getChannel, getRole, wait } = require("../../../modules/utils");
const { settings, ticketOptions, closeOption, defaultTicketEmbed } = require("../../../configs/ticketSystem");
const { getDatabase } = require("../../../modules/handlers/database");
const config = require("../../../configs/config");

/**
 * 
 * @param {Client} client 
 * @param {ButtonInteraction} interaction 
 */

module.exports = async (client, interaction) => {
    if (!interaction.isButton() || interaction.customId !== "ticket-close") return;

    if (!config.createDbConnection || !settings.enabled) {
        return interaction.reply({ content: "Ticket system or database connection is not enabled", ephemeral: true });
    };

    const db = getDatabase("tickets");

    const data = await db.findOne({
        where: {
            channel: interaction.channel.id
        },
    });

    if(!settings.openerCanClose && interaction.user.id == data.user) {
        return interaction.reply({
            content: "You can't close this ticket",
            ephemeral: true
        });
    };

    if (!data) {
        return interaction.reply({
            content: "This ticket is not found in database, can't be closed",
            ephemeral: true
        });
    };

    if (!data.active) {
        return interaction.reply({
            content: "This ticket is not active, can't be closed",
            ephemeral: true
        });
    };

    const modal = new ModalBuilder()
        .setCustomId("ticket-modal-close-" + interaction.id)
        .setTitle("Reason")
        .setComponents([
            new ActionRowBuilder()
                .setComponents([
                    new TextInputBuilder()
                        .setCustomId("ticket-reason-close-" + interaction.id)
                        .setLabel("Reason")
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(false),
                ])
        ]);

    await interaction.showModal(modal);
    const resp = await interaction.awaitModalSubmit({
        time: 30000,
        filter: (i) => i.customId == "ticket-modal-close-" + interaction.id && i.user.id == interaction.user.id
    }).catch(() => { });

    await resp.deferUpdate().catch(() => {});

    const reason = resp.fields.getTextInputValue("ticket-reason-close-" + interaction.id) || "Not provided";

    const msg = await resp.channel.send({ content: "Please wait, your request is being processed....", ephemeral: true });

    await data.update({
        active: false,
        closeReason: reason,
        closedBy: interaction.user.id,
        closeTime: interaction.createdTimestamp,
    });

    const logEmbed = new EmbedBuilder()
        .setColor(Colors.Red)
        .setAuthor({
            name: "Ticket Closed",
            iconURL: client.user.displayAvatarURL()
        })
        .setDescription([
            `- **Index:** \`${data.index}\``,
            `- **Opened By:** <@${data.user}>`,
            `- **Closed By: ** <@${interaction.user.id}>`,
            `- **Ticket ID:** \`${interaction.channel.id}\``,
            `- **Ticket Name: ** \`${interaction.channel.name}\``,
            `- **Opened:** <t:${(data.openTime / 1000).toFixed(0)}:R>`,
            `- **Closed:** <t:${(interaction.createdTimestamp / 1000).toFixed(0)}:R>`,
            `- **Opening Reason:** ${data.openReason !== null ? data.openReason : "Not provided"}`,
            `- **Closing Reason:** ${reason}`,
        ].join("\n"))

    await msg.edit({
        content: "",
        embeds: [logEmbed],
    });

    const logChannel = getChannel(settings.logging.close, interaction.guild);
    if (logChannel) {
        logChannel.send({ embeds: [logEmbed] });
    }

    await wait("3s");
    await resp.channel.delete().catch(() => { });

}