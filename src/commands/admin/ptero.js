const { ApplicationCommandOptionType, Client, CommandInteraction, EmbedBuilder, Colors } = require("discord.js");
const ptero = require("../../modules/handlers/ptero");
const ms = require("ms");
const config = require("../../../config");

module.exports = {
    name: "ptero",
    category: "Admin",
    description: "Pterodactyl Manager",
    devOnly: true,
    disabled: false,
    channelOnly: [],
    roleRequired: [],
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "power",
            description: "Start/stop/restart/kill Server",
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: "action",
                    description: "Action",
                    required: true,
                    choices: [
                        {
                            name: "🟢 Start",
                            value: "start"
                        },
                        {
                            name: "🔴 Stop",
                            value: "stop"
                        },
                        {
                            name: "🟡 Restart",
                            value: "restart"
                        },
                        {
                            name: "💀 Kill",
                            value: "kill"
                        }
                    ]
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: "server-id",
                    description: "Provide a server id to start/stop/restart/kill",
                    required: false
                }
            ]
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "info",
            description: "Get Server Info",
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: "server-id",
                    description: "Provide a server id to get info",
                    required: false
                }
            ]
        }
    ],
    execute: async (/**@type {Client} */ client, /**@type {CommandInteraction} */ interaction) => {

        if (!config.enablePteroManager) {
            return interaction.reply({ content: "Pterodactyl Manager is disabled", ephemeral: true });
        }

        const subCommand = interaction.options.getSubcommand();

        await interaction.deferReply({ ephemeral: false });
        switch (subCommand) {
            case "info": {
                const serverId = interaction.options.getString("server-id") || process.env.SERVER_ID;
                const data = await ptero.getInfo(serverId);
                if (!data) {
                    interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Pterodactyl Manager")
                                .setColor(Colors.Red)
                                .setDescription(`> Failed to get info for (\`${serverId}\`)`)
                                .setTimestamp(Date.now())
                                .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
                        ]
                    });
                };

                const embed = new EmbedBuilder()
                    .setTitle("Pterodactyl Manager")
                    .setColor(Colors.Aqua)
                    .setDescription(`> Fetched server Info for (\`${serverId}\`)`)
                    .setTimestamp(Date.now())
                    .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
                    .setThumbnail(client.user.displayAvatarURL())
                    .setFields([{
                        name: "Basic Info",
                        value: [
                            "> **Startup Command**",
                            "```",
                            `${data.invocation}`,
                            "```",
                            "> **UUID**",
                            "```",
                            `${data.uuid}`,
                            "```",
                            "> **Name**",
                            "```",
                            `${data.name}`,
                            "```",
                            `> **Type/Node** • \`${data.type}\` • \`${data.node}\``,
                            `> **Identifier/Internal-Id** • \`${data.identifier}\` • \`${data.internalId}\``,
                            "> **Resources**",
                            "```",
                            "• Memory: " + data.memory,
                            "• Disk: " + data.disk,
                            "• CPU: " + data.cpu,
                            "• Threads: " + data.threads,
                            "```",
                        ].join("\n")
                    }]);

                return interaction.editReply({ embeds: [embed] }).catch((e) => {
                    interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Pterodactyl Manager")
                                .setColor(Colors.Red)
                                .setDescription(`> Failed to get info for (\`${serverId}\`)`)
                                .setTimestamp(Date.now())
                                .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
                        ]
                    });
                });
            }

            case "power": {
                const action = interaction.options.getString("action");
                const serverId = interaction.options.getString("server-id") || process.env.SERVER_ID;

                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Pterodactyl Manager")
                            .setColor(Colors.Aqua)
                            .setDescription(`> Sent power signal to (\`${serverId}\`) • **${action}**`)
                            .setTimestamp(Date.now())
                            .setFooter({
                                text: `Requested by ${interaction.user.username}`,
                                iconURL: interaction.user.displayAvatarURL()
                            })
                    ]
                }).then(() => {
                    setTimeout(async () => {
                        const res = await ptero.changeState(action, serverId);

                        if (!res) {
                            interaction.editReply({
                                embeds: [
                                    new EmbedBuilder()
                                        .setTitle("Pterodactyl Manager")
                                        .setColor(Colors.Red)
                                        .setDescription(`> Failed to send power signal to (\`${serverId}\`) • **${action}**`)
                                        .setTimestamp(Date.now())
                                        .setFooter({
                                            text: `Requested by ${interaction.user.username}`,
                                            iconURL: interaction.user.displayAvatarURL()
                                        })
                                ]
                            }).catch(() => null);
                        };

                        if (res && res !== true) {
                            interaction.editReply({
                                embeds: [
                                    new EmbedBuilder()
                                        .setTitle("Pterodactyl Manager")
                                        .setColor(Colors.Red)
                                        .setDescription(`> Failed to send power signal to (\`${serverId}\`) • **${action}**`)
                                        .setTimestamp(Date.now())
                                        .setFooter({
                                            text: `Requested by ${interaction.user.username}`,
                                            iconURL: interaction.user.displayAvatarURL()
                                        })
                                ]
                            }).catch(() => null);
                        }
                    }, ms("1s"));
                })
            }
        }
    }
}