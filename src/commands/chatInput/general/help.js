const Command = require("../../../handlers/helpers/command");
const { getCommands } = require("../../../handlers/helpers/command");
const Pagination = require("../../../handlers/paginate");
const { splitArray } = require("../../../handlers/utils");

new Command({
    name: "help",
    category: "General",
    description: "List all commands or info about a specific command.",
    runSlash: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: false });

        const initialMessage = await interaction.editReply({
            content: "Loading pagination..."
        });

        const _commands = getCommands().map(c => {
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

            pages.push({
                content: `**Page** • [${pages.length + 1}/${splits.length}]`,
                embeds: [{
                    Title: "Help Menu",
                    Description: group,
                    Timestamp: true
                }],
            });
        }

        new Pagination(initialMessage, pages, interaction.user.id).paginate();
    }
});