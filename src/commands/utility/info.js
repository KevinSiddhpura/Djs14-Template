const { ApplicationCommandOptionType, Client, CommandInteraction, EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, ButtonInteraction, ComponentType, GuildMember } = require("discord.js");
const ms = require("ms");
const { findMember } = require("../../modules/utils");
const logger = require("../../modules/logger");

module.exports = {
    name: "info",
    category: "Utility",
    description: "Get info about server or specific user",
    devOnly: false,
    disabled: false,
    channelOnly: [],
    roleRequired: [],
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "server",
            description: "Get info about the server",
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "member",
            description: "Get info about a user",
            options: [
                {
                    type: ApplicationCommandOptionType.User,
                    name: "user",
                    description: "Get info about a user",
                    required: false
                }
            ]
        },
    ],
    execute: async (/**@type {Client} */ client, /**@type {CommandInteraction} */ interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const subCommand = interaction.options.getSubcommand();
        const guild = await interaction.guild.fetch();

        switch (subCommand) {
            case "server": {

                const categories = guild.channels.cache.filter((c) => c.type === 4).size;
                const textChannels = guild.channels.cache.filter((c) => c.type === 0).map((c) => `<#${c.id}>`).join(", ");
                const voiceChannels = guild.channels.cache.filter((c) => c.type === 2).map((c) => `<#${c.id}>`).join(", ");
                const stageChannels = guild.channels.cache.filter((c) => c.type === 13).map((c) => `<#${c.id}>`).join(", ");
                const roles = guild.roles.cache.filter((r) => r.name !== "@everyone").map((r) => `<@&${r.id}>`).join(", ");

                let page = 0;

                const pages = [
                    new EmbedBuilder()
                        .setColor(Colors.Aqua)
                        .setTitle("Server Information")
                        .setDescription([
                            `- **Name** • ${guild.name}`,
                            `- **ID** • ${guild.id}`,
                            `- **Owner** • <@${guild.ownerId}>`,
                            `- **Region** • ${guild.preferredLocale}`,
                            `- **Members** • ${guild.memberCount}`,
                            `- **Created On** • <t:${Math.floor(guild.createdTimestamp / 1000)}:f>`,
                        ].join("\n"))
                        .setThumbnail(guild.iconURL({ dynamic: true }))
                        .setFooter({
                            text: `Requested by ${interaction.user.username}`,
                            iconURL: interaction.user.displayAvatarURL()
                        }),
                    new EmbedBuilder()
                        .setColor(Colors.Aqua)
                        .setTitle("Server Channels")
                        .setDescription(`- Found **${guild.channels.cache.size - categories}** channels!`)
                        .setFields([{
                            name: "Text Channels",
                            value: textChannels || "No text channels found",
                        }, {
                            name: "Voice Channels",
                            value: voiceChannels || "No voice channels found",
                        }, {
                            name: "Stage Channels",
                            value: stageChannels || "No stage channels found",
                        }])
                        .setTimestamp(Date.now())
                        .setFooter({
                            text: `Requested by ${interaction.user.username}`,
                            iconURL: interaction.user.displayAvatarURL()
                        }),
                    new EmbedBuilder()
                        .setColor(Colors.Aqua)
                        .setTitle("Server Roles")
                        .setDescription(`- Found **${guild.roles.cache.size}** roles! \n${roles}`)
                        .setTimestamp(Date.now())
                        .setFooter({
                            text: `Requested by ${interaction.user.username}`,
                            iconURL: interaction.user.displayAvatarURL()
                        }),
                    new EmbedBuilder()
                        .setColor(Colors.Aqua)
                        .setTitle("Server Display Icon")
                        .setImage(guild.iconURL({ dynamic: true }))
                        .setTimestamp(Date.now())
                        .setFooter({
                            text: `Requested by ${interaction.user.username}`,
                            iconURL: interaction.user.displayAvatarURL()
                        })
                ];

                if (guild.banner) {
                    pages.push(new EmbedBuilder()
                        .setColor(Colors.Aqua)
                        .setTitle("Server Banner")
                        .setImage(guild.bannerURL({ dynamic: true }))
                        .setTimestamp(Date.now())
                        .setFooter({
                            text: `Requested by ${interaction.user.username}`,
                            iconURL: interaction.user.displayAvatarURL()
                        })
                    );
                };

                const getRow = () => {
                    return new ActionRowBuilder()
                        .setComponents([
                            new ButtonBuilder()
                                .setEmoji("⬅️")
                                .setLabel("Previous")
                                .setStyle("Primary")
                                .setCustomId("srv-back")
                                .setDisabled(page == 0),
                            new ButtonBuilder()
                                .setEmoji("➡️")
                                .setLabel("Next")
                                .setStyle("Primary")
                                .setCustomId("srv-next")
                                .setDisabled(page == pages.length - 1),
                        ])
                }

                const rep = await interaction.editReply({
                    embeds: [pages[0]],
                    components: [getRow()]
                });

                const collector = rep.createMessageComponentCollector({
                    componentType: ComponentType.Button,
                    time: ms("1m"),
                    filter: (i) => i.user.id === interaction.user.id
                });

                collector.on("collect", async (/**@type {ButtonInteraction} */ i) => {
                    await i.deferUpdate().catch(() => null);
                    try {
                        if (i.customId === "srv-back") {
                            page--;
                            i.editReply({
                                embeds: [pages[page]],
                                components: [getRow()]
                            });
                        } else if (i.customId === "srv-next") {
                            page++;
                            i.editReply({
                                embeds: [pages[page]],
                                components: [getRow()]
                            });
                        }
                    } catch (e) {
                        console.log(e);
                    }
                });

                collector.on("end", () => {
                    rep.edit({ components: [] }).catch(() => null);
                })

                break;
            }

            case "member": {
                const user = interaction.options.getUser("user") || interaction.user;

                /**@type {GuildMember} */
                const member = await findMember(user.id, guild);
                if (!member) {
                    return interaction.editReply({
                        content: "That user is not in this server!",
                        ephemeral: true
                    });
                }

                const embed = new EmbedBuilder()
                    .setColor(Colors.Aqua)
                    .setTitle("User Information")
                    .setDescription([
                        `- **Is Bot** • ${user.bot ? "Yes" : "No"}`,
                        `- **Global Name** • ${user.globalName || "No global name set"}`,
                        `- **Username** • ${user.username}`,
                        `- **Nickname** • ${member.nickname || "No nickname set"}`,
                        `- **ID** • ${user.id}`,
                        `- **Created On** • <t:${Math.floor(user.createdTimestamp / 1000)}:f>`,
                        `- **Joined On** • <t:${Math.floor(member.joinedTimestamp / 1000)}:f>`,
                        `- **Hext Color** • ${member.displayHexColor}`,
                        `- **Highest Role** • <@&${member.roles.highest.id}>`,
                        `- **Highest Permission** • ${member.permissions.toArray()[0] || "None"}`
                    ].join("\n"))
                    .setFields({
                        name: "Member Roles",
                        value: member.roles.cache
                            .filter(r => r.id !== guild.id)
                            .map(r => `<@&${r.id}>`)
                            .join(" ") || "No roles"
                    })
                    .setTimestamp(Date.now())
                    .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                    .setFooter({
                        text: `Requested by ${interaction.user.username}`,
                        iconURL: interaction.user.displayAvatarURL()
                    });

                return interaction.editReply({
                    embeds: [embed]
                }).catch((e) => {
                    logger.error(e);
                    interaction.editReply({
                        content: "There was an error while trying to get the user information!",
                        ephemeral: true
                    })
                })
                break;
            }
        }
    }
}