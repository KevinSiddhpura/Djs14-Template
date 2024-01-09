const { Client, StringSelectMenuInteraction, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle, EmbedBuilder, Colors } = require("discord.js");
const { getDatabase } = require("../../../modules/handlers/database");
const { settings, ticketOptions, closeOption, defaultTicketEmbed } = require("../../../configs/ticketSystem");
const config = require("../../../configs/config");
const { Op } = require("sequelize");
const { hasRole, getChannel, getRole } = require("../../../modules/utils");

const getOptionData = async (value) => {
    return ticketOptions.find(option => option.customID === value);
}

/**
 * 
 * @param {Client} client
 * @param {StringSelectMenuInteraction} interaction
 */

module.exports = async (client, interaction) => {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== "ticket-menu") return;

    if (!config.createDbConnection || !settings.enabled) {
        return interaction.reply({ content: "Ticket system or database connection is not enabled", ephemeral: true });
    };

    const db = getDatabase("tickets");
    const db_bls = getDatabase("ticketsBl");

    const userCount = await db.findAll({
        where: {
            [Op.and]: [
                {
                    user: interaction.user.id,
                    guild: interaction.guild.id,
                    active: true,
                }
            ]
        }
    });

    if (settings.maxUserTickets && userCount.length >= settings.maxUserTickets) {
        return interaction.reply({ content: "You already have " + userCount.length + " active ticket(s)", ephemeral: true });
    };

    const value = interaction.values[0];
    const ticketData = await getOptionData(value);

    if (ticketData?.settings.disabled) {
        return interaction.reply({ content: "This option is disabled", ephemeral: true });
    };

    const roleCheck = hasRole(ticketData.settings.roleRequired, interaction.member);
    if (!roleCheck) {
        return interaction.reply({ content: "You do not have the required role to use this option", ephemeral: true });
    };

    let openReason;
    let name = ticketData.settings.naming;
    let topic = ticketData.settings.topic;

    if (name.includes("{user-username}")) {
        name = name.replace("{user-username}", interaction.user.username);
    } else if (name.includes("{user-id}")) {
        name = name.replace("{user-id}", interaction.user.id);
    } else if (name.includes("{user-tag}")) {
        name = name.replace("{user-tag}", interaction.user.tag);
    };

    if (topic.includes("{user-username}")) {
        topic = topic.replace("{user-username}", interaction.user.username);
    } else if (topic.includes("{user-id}")) {
        topic = topic.replace("{user-id}", interaction.user.id);
    } else if (topic.includes("{user-tag}")) {
        topic = topic.replace("{user-tag}", interaction.user.tag);
    };

    if (ticketData.settings.askOpenReason) {
        const modal = new ModalBuilder()
            .setCustomId("ticket-modal-open-" + interaction.id)
            .setTitle("Support System")
            .setComponents([
                new ActionRowBuilder()
                    .setComponents([
                        new TextInputBuilder()
                            .setCustomId("ticket-open_reason-" + interaction.id)
                            .setLabel("Reason")
                            .setStyle(TextInputStyle.Paragraph)
                            .setRequired(true),
                    ])
            ]);

        await interaction.showModal(modal);
        const resp = await interaction.awaitModalSubmit({
            time: 120000,
            filter: (m) => m.customId === "ticket-modal-open-" + interaction.id
        });

        if (resp) {

            await resp.reply({ content: "Please wait...", ephemeral: true });

            openReason = resp.fields.getTextInputValue("ticket-open_reason-" + interaction.id);

            const category = getChannel(ticketData.settings.category, interaction.guild);
            if (!category) {
                return resp.reply({ content: "Ticket category not found", ephemeral: true });
            };

            const supportRoles = settings.support;
            const managerRoles = settings.managers;
            const s = [];
            const m = [];

            for (let i = 0; i < supportRoles.length; i++) {
                const role = getRole(supportRoles[i], interaction.guild);
                if (role) s.push({
                    id: role.id,
                    allow: settings.supportPermissions
                });
            };

            for (let i = 0; i < managerRoles.length; i++) {
                const role = getRole(managerRoles[i], interaction.guild);
                if (role) m.push({
                    id: role.id,
                    allow: settings.managerPermissions
                });
            };

            await resp.guild.channels.create({
                name,
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone.id,
                        deny: ["ViewChannel"],
                    },
                    {
                        id: interaction.user.id,
                        allow: settings.openerPermissions,
                    },
                    ...s,
                    ...m,
                ],
                reason: openReason,
                topic,
            }).then(async (channel) => {
                let embed;

                if (!ticketData.customPanel) {
                    embed = defaultTicketEmbed(resp);
                } else {
                    embed = ticketData.customPanel.length > 0 ? ticketData.customPanel : defaultTicketEmbed(resp);
                };

                const reasonEmb = new EmbedBuilder()
                    .setDescription(openReason)
                    .setColor(Colors.Orange)
                    .setAuthor({
                        name: "Mentioned Reason",
                        iconURL: resp.user.displayAvatarURL()
                    })

                const row = new ActionRowBuilder();
                if (ticketData.settings.claimable) {
                    row.addComponents(
                        new ButtonBuilder()
                            .setCustomId("ticket-claim-" + channel.id)
                            .setLabel("Claim Ticket")
                            .setEmoji("📌")
                            .setStyle(ButtonStyle.Success),
                    )
                };

                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(closeOption.value)
                        .setLabel(closeOption.label)
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji(closeOption.emoji),
                )

                await channel.send({
                    content: "",
                    embeds: embed,
                    components: [row]
                }).then(async (msg) => {
                    await db.create({
                        guild: interaction.guild.id,
                        channel: channel.id,
                        user: interaction.user.id,
                        message: msg.id,
                        isClaimed: false,
                        isOnHold: false,
                        active: true,
                        openReason,
                        closeReason: null,
                        openTime: interaction.createdTimestamp,
                        closeTime: null,
                        transcriptURL: null,
                        closedBy: null,
                        claimedBy: null,
                        claimedAt: null,
                    });

                    msg.pin().catch(() => { });

                    await channel.send({ embeds: [reasonEmb] }).catch(() => { });

                    await resp.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setAuthor({
                                    name: "Ticket System",
                                    iconURL: client.user.displayAvatarURL(),
                                })
                                .setDescription([
                                    `- Your support ticket has been created at <#${channel.id}>`,
                                    `> Opened <t:${(interaction.createdTimestamp / 1000).toFixed(0)}:R>`,
                                ].join("\n"))
                                .setColor(Colors.Aqua)
                                .setFooter({
                                    text: interaction.guild.name,
                                    iconURL: interaction.guild.iconURL({ dynamic: true }),
                                })
                        ],
                        ephemeral: true
                    })
                })
            })
        };
    } else {
        await interaction.deferReply({ ephemeral: true });

        await interaction.editReply({ content: "Please wait...", ephemeral: true });

        const category = getChannel(ticketData.settings.category, interaction.guild);
        if (!category) {
            return interaction.editReply({ content: "Ticket category not found", ephemeral: true });
        };

        const supportRoles = settings.support;
        const managerRoles = settings.managers;
        const s = [];
        const m = [];

        for (let i = 0; i < supportRoles.length; i++) {
            const role = getRole(supportRoles[i], interaction.guild);
            if (role) s.push({
                id: role.id,
                allow: settings.supportPermissions
            });
        };

        for (let i = 0; i < managerRoles.length; i++) {
            const role = getRole(managerRoles[i], interaction.guild);
            if (role) m.push({
                id: role.id,
                allow: settings.managerPermissions
            });
        };

        await resp.guild.channels.create({
            name,
            parent: category.id,
            permissionOverwrites: [
                {
                    id: interaction.guild.roles.everyone.id,
                    deny: ["ViewChannel"],
                },
                {
                    id: interaction.user.id,
                    allow: settings.openerPermissions,
                },
                ...s,
                ...m,
            ],
            reason: openReason,
            topic,
        }).then(async (channel) => {
            let embed;

            if (!ticketData.customPanel) {
                embed = defaultTicketEmbed(resp);
            } else {
                embed = ticketData.customPanel.length > 0 ? ticketData.customPanel : defaultTicketEmbed(interaction);
            };

            const row = new ActionRowBuilder();
            if (ticketData.settings.claimable) {
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId("ticket-claim-" + channel.id)
                        .setLabel("Claim Ticket")
                        .setEmoji("📌")
                        .setStyle(ButtonStyle.Success),
                )
            };

            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(closeOption.value)
                    .setLabel(closeOption.label)
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji(closeOption.emoji),
            );

            await channel.send({
                content: "",
                embeds: embed,
                components: [row]
            }).then(async (msg) => {
                await db.create({
                    guild: interaction.guild.id,
                    channel: channel.id,
                    user: interaction.user.id,
                    message: msg.id,
                    isClaimed: false,
                    isOnHold: false,
                    active: true,
                    openReason,
                    closeReason: null,
                    openTime: interaction.createdTimestamp,
                    closeTime: null,
                    transcriptURL: null,
                    closedBy: null,
                    claimedBy: null,
                    claimedAt: null,
                });

                await interaction.editReply({
                    content: "",
                    embeds: [
                        new EmbedBuilder()
                            .setAuthor({
                                name: "Ticket System",
                                iconURL: client.user.displayAvatarURL(),
                            })
                            .setDescription([
                                `- Your support ticket has been created at <#${channel.id}>`,
                                `> Opened <t:${(interaction.createdTimestamp / 1000).toFixed(0)}:R>`,
                            ].join("\n"))
                            .setColor(Colors.Aqua)
                            .setFooter({
                                text: interaction.guild.name,
                                iconURL: interaction.guild.iconURL({ dynamic: true }),
                            })
                    ],
                    ephemeral: true
                })
            })
        })
    }
}