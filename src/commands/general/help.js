const { Client, CommandInteraction, EmbedBuilder, ActionRowBuilder, Colors, StringSelectMenuBuilder } = require("discord.js");
const { getCommands } = require("../../modules/utils");

module.exports = {
    name: "help",
    category: "General",
    description: "Shows all commands.",
    devOnly: false,
    disabled: false,
    roleRequired: false,
    options: [],
    execute: async (/**@type {Client} */ client, /**@type {CommandInteraction} */ interaction) => {
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

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Help Menu")
                    .setColor(Colors.Aqua)
                    .setDescription("> Select a category to view commands. \n- The menu will expire in **1 minute**")
                    .setFooter({
                        text: `Requested by ${interaction.user.username}`,
                        iconURL: interaction.user.displayAvatarURL()
                    })
                    .setTimestamp()
                    .setThumbnail(client.user.displayAvatarURL())
            ],
            components: [row]
        });

        const filter = (i) => {
            i.deferUpdate();
            return i.customId === 'select-category' && i.user.id === interaction.user.id;
        };

        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (i) => {
            const selectedCategory = i.values[0];
            const categoryCommands = commands.filter(cmd => cmd.category === selectedCategory);

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`${selectedCategory} Commands`)
                        .setDescription(`- Commands in the **${selectedCategory}** category.`)
                        .addFields(
                            categoryCommands.map(c => {
                                return {
                                    name: `**/${c.name}**`,
                                    value: [
                                        "```",
                                        `Description: ${c.description}`,
                                        "```"
                                    ].join("\n")
                                };
                            })
                        )
                        .setFooter({
                            text: `Requested by ${interaction.user.username}`,
                            iconURL: interaction.user.displayAvatarURL()
                        })
                        .setTimestamp(Date.now())
                        .setColor("Aqua")
                ],
                components: [row]
            });
        });

        collector.on('end', () => {
            interaction.editReply({ components: [] });
        });
    }
};
