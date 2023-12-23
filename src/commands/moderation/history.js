const { ApplicationCommandOptionType, Client, CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder, Colors } = require("discord.js");
const { getDatabase } = require("../../modules/handlers/database");

module.exports = {
    name: "history",
    category: "Moderation",
    description: "Fetch infractions history",
    devOnly: false,
    disabled: false,
    roleRequired: ["Mod"],
    options: [
        {
            type: ApplicationCommandOptionType.User,
            name: "user",
            description: "Mention the user to fetch infractions history",
            required: true,
        },
    ],
    execute: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: false });

        const user = interaction.options.getUser("user");
        const db = getDatabase("infractions");
        const data = await db.findAll({
            where: {
                user: user.id
            },
            order: [['given', 'DESC']]
        });

        if (data.length === 0) {
            return interaction.editReply("No infractions found for the mentioned user.");
        }

        let currentPage = 0;
        let currentFilter = 'all';
        const itemsPerPage = 2;

        const embed = new EmbedBuilder()
            .setTitle(`Infraction History for ${user.username}`)
            .setColor(Colors.Red)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }));

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('previous')
                    .setLabel('Previous')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('Next')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(data.length <= itemsPerPage),
            );

        const row2 = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('filter')
                    .setPlaceholder('Select Infraction Type')
                    .addOptions([
                        {
                            label: "Filter: Show All",
                            value: "all"
                        },
                        {
                            label: "Filter: Warns",
                            value: "warn"
                        },
                        {
                            label: "Filter: Kicks",
                            value: "kick"
                        },
                        {
                            label: "Filter: Mutes",
                            value: "mute"
                        },
                        {
                            label: "Filter: Temp-Mutes",
                            value: "temp-mute"
                        },
                        {
                            label: "Filter: Bans",
                            value: "ban"
                        },
                        {
                            label: "Filter: Temp-Bans",
                            value: "temp-ban"
                        }
                    ])
            );

        function getFilteredData(filter) {
            return filter === 'all' ? data : data.filter(item => item.action === filter);
        }

        function updateEmbed(page, filter) {
            const filteredData = getFilteredData(filter);
            const pageData = filteredData.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

            embed.setDescription([
                "- **User** • " + `<@${user.id}> | (${user.id})`,
                "- **Filter Infs** • " + filteredData.length,
            ].join("\n"))

            embed.setFields(pageData.map((infraction, index) => ({
                name: `#${page * itemsPerPage + index + 1} • ${infraction.action.toUpperCase()}`,
                value: [
                    "> **Moderator** • <@" + infraction.moderator + "> | (" + infraction.moderator + ")",
                    "- **Judgement Passed** • " + "<t:" + (infraction.given / 1000).toFixed(0) + ":R>",
                    `> **Reason:** ${infraction.reason}`,
                ].join('\n')
            })));

            embed.setFooter({ text: `Showing Page ${page + 1} of ${Math.ceil(filteredData.length / itemsPerPage)}`, iconURL: interaction.guild.iconURL() });

            row.components[0].setDisabled(page === 0);
            row.components[1].setDisabled((page + 1) * itemsPerPage >= filteredData.length);
        }

        updateEmbed(0, currentFilter);

        const msg = await interaction.editReply({ embeds: [embed], components: [row2, row] });

        const filter = async (i) => {
            await i.deferUpdate().catch(() => { });
            return i.customId === 'filter' && i.user.id === interaction.user.id;
        };
        const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (i) => {
            if (i.customId === 'next') {
                currentPage++;
            } else if (i.customId === 'previous') {
                currentPage--;
            }
            updateEmbed(currentPage, currentFilter);
            await i.editReply({ embeds: [embed], components: [row2, row] });
        });

        const selectCollector = msg.createMessageComponentCollector({ filter, time: 60000 });

        selectCollector.on('collect', async (i) => {
            currentFilter = i.values[0];
            currentPage = 0;
            updateEmbed(currentPage, currentFilter);
            await i.editReply({ embeds: [embed], components: [row2, row] });
        });

        collector.on('end', () => {
            msg.edit({ components: [] });
        });
    }
};
