const { ApplicationCommandOptionType, Client, CommandInteraction, EmbedBuilder, Colors } = require("discord.js");
const ptero = require("../../modules/ptero");
const ms = require("ms");
const config = require("../../../config.json");

module.exports = {
    name: "ptero",
    category: "Dev",
    description: "Pterodactyl Manager",
    devOnly: false,
    disabled: false,
    roleRequired: ["Admin"],
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
        }
    ],
    execute: async (/**@type {Client} */ client, /**@type {CommandInteraction} */ interaction) => {

        if(!config.pteroManager.enabled) {
            return interaction.reply({ content: "Pterodactyl Manager is disabled", ephemeral: true });
        }

        const subCommand = interaction.options.getSubcommand();

        await interaction.deferReply({ ephemeral: false });
        switch (subCommand) {
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

                        if (res && res !== 204) {
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