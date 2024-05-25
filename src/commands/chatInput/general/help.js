const { Command, commandCollection } = require("../../../handlers/helpers/command");

module.exports = new Command({
    name: "help",
    category: "General",
    description: "List all commands or info about a specific command.",
    runSlash: (client, interaction) => {
        interaction.reply({
            content: `Commands: ${commandCollection.filter(x => x.name != "help").map(cmd => `\`${cmd.name}\``).join(", ")}`,
            ephemeral: true
        });
    }
});