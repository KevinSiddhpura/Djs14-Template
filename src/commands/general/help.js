const { Client, CommandInteraction, EmbedBuilder, ActionRowBuilder, Colors, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, Message } = require("discord.js");
const { getCommands, capitalizeFirstLetter } = require("../../modules/utils");

module.exports = {
    name: "help",
    category: "General",
    description: "Shows all commands.",
    devOnly: false,
    disabled: false,
    channelOnly: ["commands"],
    roleRequired: [],
    options: [],

    /**
     * 
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     */

    runSlash: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: false });

        const commands = getCommands();
        const categories = [...new Set(commands.map(cmd => cmd.category))];

        const categorySelectMenu = new StringSelectMenuBuilder()
            .setCustomId('select-category')
            .setPlaceholder('Choose a category')
            .addOptions(
                categories.map(category => {
                    return {
                        label: `${category} • Commands`,
                        value: category
                    };
                })
            );

        const row = new ActionRowBuilder().addComponents(categorySelectMenu);

        const msg = await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Help Menu")
                    .setColor(Colors.Aqua)
                    .setDescription("> Select a category to view commands.\n- The menu will expire in **1 minute**")
                    .setFooter({
                        text: `Requested by ${interaction.user.username}`,
                        iconURL: interaction.user.displayAvatarURL()
                    })
                    .setTimestamp()
                    .setThumbnail(client.user.displayAvatarURL())
            ],
            components: [row]
        });

        const selectMenuFilter = (i) => i.customId === 'select-category' && i.user.id === interaction.user.id;
        const buttonFilter = (i) => (i.customId === 'previous' || i.customId === 'next') && i.user.id === interaction.user.id;

        const selectMenuCollector = msg.createMessageComponentCollector({ filter: selectMenuFilter, time: 60000 });

        selectMenuCollector.on('collect', async (i) => {
            await i.deferUpdate().catch(() => { })
            const selectedCategory = i.values[0];
            const categoryCommands = commands.filter(cmd => cmd.category === selectedCategory);
            let page = 0;
            const pageSize = 5;
            const totalPages = Math.ceil(categoryCommands.length / pageSize);

            const updateEmbed = (page) => {
                const startIndex = page * pageSize;
                const endIndex = startIndex + pageSize;
                const commandsPage = categoryCommands.slice(startIndex, endIndex);

                return new EmbedBuilder()
                    .setTitle(`${selectedCategory} Commands`)
                    .setDescription(`- Commands in the **${selectedCategory}** category.`)
                    .setThumbnail(client.user.displayAvatarURL())
                    .addFields(
                        commandsPage.map(c => {
                            return {
                                name: `**/${capitalizeFirstLetter(c.name)}**`,
                                value: `>>> _${c.description}_`
                            };
                        })
                    )
                    .setFooter({
                        text: `Page ${page + 1} of ${totalPages} | Requested by ${interaction.user.username}`,
                        iconURL: interaction.user.displayAvatarURL()
                    })
                    .setTimestamp(Date.now())
                    .setColor(Colors.Aqua);
            };

            const paginationRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('previous')
                        .setLabel('Previous')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === 0),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('Next')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === totalPages - 1)
                );

            await i.editReply({
                embeds: [updateEmbed(page)],
                components: [paginationRow, row]
            });

            const buttonCollector = msg.createMessageComponentCollector({ filter: buttonFilter, time: 60000 });

            buttonCollector.on('collect', async (buttonInteraction) => {
                if (buttonInteraction.customId === 'previous' && page > 0) {
                    page--;
                } else if (buttonInteraction.customId === 'next' && page < totalPages - 1) {
                    page++;
                } else {
                    return;
                }

                const updatedPaginationRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('previous')
                            .setLabel('Previous')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(page === 0),
                        new ButtonBuilder()
                            .setCustomId('next')
                            .setLabel('Next')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(page === totalPages - 1)
                    );

                await buttonInteraction.deferUpdate().catch(() => { });
                await buttonInteraction.editReply({
                    embeds: [updateEmbed(page)],
                    components: [updatedPaginationRow, row]
                });
            });

            buttonCollector.on('end', () => {
                interaction.editReply({ components: [] });
            });
        });

        selectMenuCollector.on('end', () => {
            interaction.editReply({ components: [] });
        });
    },

    /**
     * 
     * @param {Client} client 
     * @param {Message} interaction
     * @param {Array} args
     */

    runLegacy: async (client, message, args) => {
    
    }
};
