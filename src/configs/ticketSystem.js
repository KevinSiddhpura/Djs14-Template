const { EmbedBuilder, Colors, StringSelectMenuInteraction } = require("discord.js");

const settings = {
    enabled: true,
    maxUserTickets: 5,
    logging: {
        create: "tickets-created",
        close: "tickets-closed",
        transcripts: "transcripts",
    },
    transcripting: {
        enabled: false,
    },
    managers: ["Admin"],
    support: ["Mod"],
    openerPermissions: ["SendMessages", "ViewChannel", "ReadMessageHistory", "AttachFiles", "EmbedLinks"],
    supportPermissions: ["SendMessages", "ViewChannel", "ReadMessageHistory", "AttachFiles", "EmbedLinks"],
    managerPermissions: ["SendMessages", "ViewChannel", "ReadMessageHistory", "AttachFiles", "EmbedLinks", "ManageRoles", "ManageChannels", "ManageMessages"],
    openerCanClose: true,
};

/**
 * 
 * @param {StringSelectMenuInteraction} interaction
 */

const defaultTicketEmbed = (interaction) => {
    return [
        new EmbedBuilder()
            .setTitle("Support Ticket")
            .setDescription([
                "Our staff member will be with you shortly",
                "In the mean time, feel free to list down questions you have",
                "- __Note: Please don't spam ping the support members!__"
            ].join("\n"))
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setFields([{
                name: "Extra Info",
                value: `> **Opener** • <@${interaction.user.id}> | (${interaction.user.id}) \n> **Opened** <t:${(interaction.createdTimestamp / 1000).toFixed(0)}:R>`,
                inline: true
            }])
            .setColor(Colors.Orange)
    ]
}

const closeOption = {
    label: "Close Ticket",
    emoji: "🔒",
    value: "ticket-close"
};

const ticketOptions = [{
    customID: "ticket_option-general",
    menu: {
        label: "General Support",
        description: "Get support from staff members",
        emoji: "🎫"
    },
    settings: {
        disabled: false,
        category: "tickets",
        naming: "general-{user-username}",
        topic: "General Support | {user-username}",
        claimable: false,
        roleRequired: "Members",
        askOpenReason: true,
    },
    customPanel: false,
}, {
    customID: "ticket_option-vip",
    menu: {
        label: "VIP Support",
        description: "Get prioritized support from staff members",
        emoji: "💎"
    },
    settings: {
        disabled: false,
        category: "tickets",
        naming: "vip-{user-username}",
        topic: "VIP Support | {user-username}",
        claimable: true,
        roleRequired: "VIP",
        askOpenReason: true,
    },
    customPanel: [{
        author: {
            name: "VIP Support",
        },
        title: "VIP Support",
        description: "Get VIP support from staff members",
        fields: [
            {
                name: "VIP Support",
                value: "Get VIP support from staff members",
            }
        ],
        color: Colors.Gold
    }]
}]

module.exports = { settings, defaultTicketEmbed, closeOption, ticketOptions };