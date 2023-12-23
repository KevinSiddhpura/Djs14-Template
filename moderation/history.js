    const { ApplicationCommandOptionType, Client, CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder, Colors } = require("discord.js");
    const { getDatabase } = require("../src/modules/handlers/database");
    const { Op } = require("sequelize");

    module.exports = {
        name: "history",
        category: "Moderation",
        description: "Shows the infraction history of a user",
        devOnly: false,
        disabled: false,
        roleRequired: ["Mod"],
        options: [
            {
                type: ApplicationCommandOptionType.User,
                name: "user",
                description: "Mention the user to get infraction history",
                required: true,
            }
        ],
        execute: async ( /**@type {Client} */ client, /**@type {CommandInteraction} */ interaction) => {
            await interaction.deferReply({ ephemeral: false });

            const modDB = getDatabase("moderation");
            const modHistory = getDatabase("moderationHistory");

            const user = interaction.options.getUser("user");
            const _main = await modDB.findOne({
                where: {
                    [Op.and]: [
                        {
                            guildId: interaction.guildId,
                            userId: user.id,
                        },
                    ]
                }
            });

            if (!_main) {
                return interaction.editReply({ content: "This user has no infraction history." });
            };

            const _history = await modHistory.findOne({
                where: {
                    [Op.and]: [
                        {
                            guildId: interaction.guildId,
                            userId: user.id
                        }
                    ]
                }
            });

            const history = JSON.parse(_history.history);

            const combined = [];
            for (const item of history) {
                combined.push(item);
            };

            combined.sort((a, b) => a.timeStamp > b.timeStamp);

            const mutes = [];
            const bans = [];
            const warns = [];

            for (const item of combined) {
                if (item.action === "mute") {
                    mutes.push(item);
                } else if (item.action === "ban") {
                    bans.push(item);
                } else if (item.action === "warn") {
                    warns.push(item);
                } else if (item.action === "temp-mute") {
                    mutes.push(item);
                } else if (item.action === "temp-ban") {
                    bans.push(item);
                }
            }

            let currentFilter = 'all';

            function getFilteredHistory(filter) {
                switch (filter) {
                    case 'mute':
                        return mutes;
                    case 'ban':
                        return bans;
                    case 'warn':
                        return warns;
                    default:
                        return combined;
                }
            }


            let currentPage = 0;
            const itemsPerPage = 2;
            const embed = new EmbedBuilder();
            embed.setTitle(`Showing Infraction History`);
            embed.setDescription([
                "- **User** • " + `<@${user.id}> | (${user.id})`,
            ].join("\n"))
            embed.setColor(Colors.Red);
            embed.setThumbnail(user.displayAvatarURL({ dynamic: true }));

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('previous')
                        .setLabel('Previous Page')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentPage === 0),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('Next Page')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(history.length <= itemsPerPage),
                );

            const row2 = new ActionRowBuilder()
                .setComponents([
                    new StringSelectMenuBuilder()
                        .setCustomId('filter')
                        .setPlaceholder('Select Infraction Type')
                        .addOptions([
                            {
                                label: "Show all together",
                                value: "all",
                                emoji: "📃",
                            },
                            {
                                label: 'Show mutes and temp-mutes',
                                value: 'mute',
                                emoji: "🤐"
                            },
                            {
                                label: 'Show bans and temp-bans',
                                value: 'ban',
                                emoji: "🔨"
                            },
                            {
                                label: 'Show all warnings',
                                value: 'warn',
                                emoji: "⚠️"
                            }
                        ])
                ])

            function updateEmbed(page, filter) {
                const filteredHistory = getFilteredHistory(filter);
                const pageItems = filteredHistory.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

                embed.setFields([]);
                pageItems.forEach((infraction, index) => {
                    const infTime = "<t:" + (infraction.timeStamp / 1000).toFixed(0) + ":R>";
                    embed.addFields({
                        name: `#${page * itemsPerPage + index + 1} • ${infraction.action}`,
                        value: [
                            "> **Moderator** • <@" + infraction.moderator + "> | (" + infraction.moderator + ")",
                            "- **Judgement Passed** " + infTime,
                            "> **Reason:**",
                            "```",
                            infraction.message,
                            "```",
                        ].join('\n'),
                    });
                });

                embed.setFooter({ text: `Showing Page • (${page + 1}/${Math.ceil(filteredHistory.length / itemsPerPage)})`, iconURL: interaction.guild.iconURL() });

                row.components[0].setDisabled(page === 0);
                row.components[1].setDisabled((page + 1) * itemsPerPage >= filteredHistory.length);
            }

            updateEmbed(0, currentFilter);
            const msg = await interaction.editReply({ embeds: [embed], components: [row, row2] });

            const filter = i => i.user.id === interaction.user.id;
            const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async i => {

                await i.deferUpdate({}).catch(() => { });

                if (i.customId === 'next') {
                    currentPage++;
                    updateEmbed(currentPage, currentFilter);
                } else if (i.customId === 'previous') {
                    currentPage--;
                    updateEmbed(currentPage, currentFilter);
                } else if (i.isStringSelectMenu()) {
                    currentFilter = i.values[0];
                    currentPage = 0;
                    updateEmbed(currentPage, currentFilter);
                }

                row.components[0].setDisabled(currentPage === 0);
                row.components[1].setDisabled((currentPage + 1) * itemsPerPage >= history.length);

                await i.editReply({ embeds: [embed], components: [row2, row] });
            });

            collector.on('end', () => {
                msg.edit({ components: [] });
            });
        }
    }
