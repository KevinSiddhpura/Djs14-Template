const { ApplicationCommandOptionType, Client, CommandInteraction, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const { settings, defaultTicketEmbed, closeOption, ticketOptions } = require("../../configs/ticketSystem");
const { getDatabase } = require("../../modules/handlers/database");
const config = require("../../configs/config");

const getMenuOptions = (configOptions) => {
    return configOptions.map(option => {
        return {
            label: option.menu.label,
            description: option.menu.description,
            emoji: option.menu.emoji,
            value: option.customID
        }
    });
}

module.exports = {
    name: "tickets",
    category: "Admin",
    description: "Ticket system",
    devOnly: false,
    disabled: false,
    channelOnly: false,
    roleRequired: ["Admin"],
    options: [{
        type: ApplicationCommandOptionType.Subcommand,
        name: "deploy",
        description: "Deploy creation panel",
    }],
    execute: async (/**@type {Client} */ client, /**@type {CommandInteraction} */ interaction) => {

        if (!config.createDbConnection || !settings.enabled) {
            return interaction.reply({
                content: "Database connection is not enabled or ticket system is not enabled!",
                ephemeral: true
            })
        }

        const db = getDatabase("tickets");
        const db_bls = getDatabase("ticketsBl");

        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case "deploy": {
                const menuOptions = getMenuOptions(ticketOptions);
                const row = new ActionRowBuilder()
                    .setComponents([
                        new StringSelectMenuBuilder()
                            .setCustomId("ticket-menu")
                            .setPlaceholder("Select a ticket option")
                            .setMaxValues(1).setMinValues(0)
                            .setOptions([...menuOptions]),
                    ]);

                await interaction.channel.send({
                    components: [row],
                })

                return interaction.reply({
                    content: "Deployed!",
                    ephemeral: true
                });
            }
        }
    }
}