const { Colors } = require("discord.js");
const createMessage = require("../../../handlers/createMessage");
const { Command, commandCollection } = require("../../../handlers/helpers/command");
const { Pagination } = require("../../../handlers/paginate");
const { splitArray } = require("../../../handlers/utils");

new Command({
    name: "help",
    category: "General",
    description: "List all commands or info about a specific command.",
    runSlash: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: false });

        const initialMessage = await interaction.editReply({
            content: "Loading pagination...",
            fetchReply: true
        });

        const _commands = commandCollection.map(c => {
            return {
                name: c.name,
                category: c.category,
                description: c.description,
                type: c.type,
            }
        });

        const splits = splitArray(_commands, 3);
        const pages = [];

        for (const split of splits) {
            const group = split.map((command) => {
                let { name, description, category, type } = command;
                if (description == null) description = "Not provided";

                return `> **\`${type == 1 ? `/${name}` : `${name}`}\`** • \`[${category}]\` \n- _${description}_`
            }).join("\n");

            pages.push(createMessage({
                content: `**Page** • [${pages.length + 1}/${splits.length}]`,
                embeds: [{
                    Title: "Help Menu",
                    Color: Colors.Aqua,
                    Description: group,
                    FooterText: `Requested by ${interaction.user.username}`,
                    FooterIcon: interaction.user.displayAvatarURL({ dynamic: true }),
                    Timestamp: true
                }],
            }));
        }

        new Pagination(initialMessage, pages, interaction.user.id).paginate();
    }
});