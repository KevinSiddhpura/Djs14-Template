const { ApplicationCommandOptionType, Client, CommandInteraction } = require("discord.js");
const { getDatabase } = require("../../modules/handlers/database");

module.exports = {
    name: "unban",
    category: "Moderation",
    description: "Unban a user",
    devOnly: false,
    disabled: false,
    roleRequired: ["Admin"],
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: "user",
            description: "Provide a user id to unban",
            required: true,
        },
    ],
    execute: async (/**@type {Client} */ client, /**@type {CommandInteraction} */ interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const userId = interaction.options.getString("user");
        const db = getDatabase("infractions");
        const bannedUsers = await interaction.guild.bans.fetch();

        const data = await db.findOne({
            where: {
                userId: userId,
            },
        });

        if (data && data.currentBan) {
            await data.update({
                currentBan: JSON.stringify([]),
            });
        };

        if (!bannedUsers.has(userId)) {
            return interaction.editReply("User is not banned");
        } else {
            await interaction.guild.bans.remove(userId);
            return interaction.editReply("User has been unbanned");
        };
    }
}