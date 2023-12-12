const { Client, CommandInteraction, EmbedBuilder } = require("discord.js");
const { getCommands } = require("../../modules/utils");
const path = require("path");

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

        interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Commands Menu")
                    .setDescription(`- All the commands are application commands [/].`)
                    .addFields(
                        commands.map((c) => {
                            return {
                                name: `**/${c.name}** • **${c.category}**`,
                                value: [
                                    "```",
                                    `Description: ${c.description}`,
                                    "```"
                                ].join("\n")
                            }
                        })
                    )
                    .setFooter({
                        text: `Requested by ${interaction.user.username}`,
                        iconURL: interaction.user.displayAvatarURL()
                    })
                    .setTimestamp(Date.now())
                    .setColor("Aqua")
            ]
        })
    }
}