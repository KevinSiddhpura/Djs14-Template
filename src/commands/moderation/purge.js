const { ApplicationCommandOptionType, Client, CommandInteraction } = require("discord.js");

module.exports = {
    name: "purge",
    category: "Moderation",
    description: "Clear chat messages",
    devOnly: false,
    disabled: false,
    channelOnly: [],
    roleRequired: ["Mod"],
    options: [
        {
            type: ApplicationCommandOptionType.Integer,
            name: "amount",
            description: "No. of messages to purge",
            required: true,
        }
    ],
    execute: async (/**@type {Client} */ client, /**@type {CommandInteraction} */ interaction) => {

        await interaction.deferReply({ ephemeral: true });

        const amount = interaction.options.getInteger("amount");

        if (amount < 1 || amount > 100) {
            return interaction.editReply({
                content: "You can only delete between 1 and 100 messages at a time.",
                ephemeral: true
            });
        }

        const messages = await interaction.channel.messages.fetch({ limit: amount });
        await interaction.channel.bulkDelete(messages, true).then(deleted => {
            return interaction.editReply({
                content: `Successfully deleted ${deleted.size} messages.`,
                ephemeral: true
            });
        }).catch((e) => {
            return interaction.editReply({
                content: "There was an error trying to delete messages in this channel.",
                ephemeral: true
            });
        });
    }
}