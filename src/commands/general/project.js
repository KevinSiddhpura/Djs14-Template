const { Client, CommandInteraction, EmbedBuilder, ActionRowBuilder, Colors, ButtonBuilder } = require("discord.js");
const logger = require("../../modules/logger");

module.exports = {
    name: "project",
    category: "General",
    description: "About this project",
    devOnly: false,
    disabled: false,
    roleRequired: false,
    options: [],
    execute: async (/**@type {Client} */ client, /**@type {CommandInteraction} */ interaction) => {
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Aqua)
                    .setTitle("Djs14-Bot Project")
                    .setDescription([
                        "> **Project Author** • [**`GitHub.com/KevinSidd`**](https://github.com/KevinSidd)",
                        "> **Project Repository** • [**`GitHub.com/Djs14-Bot`**](https://github.com/KevinSidd/Djs14-Bot)",
                    ].join("\n"))
                    .setFields([
                        {
                            name: "Overview",
                            value: [
                                "- This discord.js v14 handler simplifies bot development by providing a streamlined command and event management system, ensuring ease of use with discord.js's latest features."
                            ].join("\n"),
                            inline: false,
                        },
                        {
                            name: "Features",
                            value: [
                                "- Efficient command and event handling tailored for Discord.js v14.",
                                "- Modular design for flexible customization.",
                                "- Planned updates for additional commands and utilities.",
                            ].join("\n"),
                        },
                        {
                            name: "Prerequisites",
                            value: [
                                "- Node.js v16.9+",
                                "- Discord.js v14",
                            ].join("\n"),
                        },
                        {
                            name: "Resources",
                            value: [
                                "- [**`Discord.js Guide`**](https://discordjs.guide/#before-you-begin) • Ultimate guide to Discord.js",
                                "- [**`Discord.js Documentation`**](https://discord.js.org/docs/packages/discord.js/main) • Official Discord.js documentation",
                            ].join("\n"),
                        },
                        {
                            name: "Acknowledgments",
                            value: [
                                "- This project is a continuous effort. We appreciate your contributions and feedback. Happy coding!",
                            ].join("\n"),
                        }
                    ])
            ],
            components: [
                new ActionRowBuilder()
                .setComponents([
                    new ButtonBuilder()
                    .setURL("https://github.com/KevinSidd/Djs14-Bot")
                    .setLabel("GitHub")
                    .setStyle("Link"),
                    new ButtonBuilder()
                    .setURL("https://discord.kwin.in")
                    .setLabel("Support Server")
                    .setStyle("Link"),
                ])
            ],
            ephemeral: true,
        }).catch((e) => {
            logger.error(e);
            return interaction.reply({
                content: "There was an error while executing this command!",
                ephemeral: true,
            })
        })
    }
}