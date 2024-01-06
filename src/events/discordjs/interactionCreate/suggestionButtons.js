const { Client, ButtonInteraction } = require("discord.js");
const { getDatabase } = require("../../../modules/handlers/database");
const { Op } = require("sequelize");
const { updateSuggestionMessageVoteAction } = require("../../../modules/utils");
const suggestionSystem = require("../../../configs/suggestionSystem");

/**
 * 
 * @param {Client} client 
 * @param {ButtonInteraction} interaction 
 */

module.exports = async (client, interaction) => {
    if (!interaction.isButton() || !interaction.customId.startsWith("suggestion-")) return;
    const customID = interaction.customId;

    await interaction.deferReply({ ephemeral: true });

    const db = getDatabase("suggestions");
    const data = await db.findOne({
        where: {
            [Op.and]: [
                {
                    message: interaction.message.id,
                    guild: interaction.guild.id,
                }
            ]
        }
    });

    if (!data) {
        return interaction.editReply({ content: "This suggestion was not found in database" });
    };

    /**@type {Array} */
    let votedUsers = JSON.parse(data.votedUsers);

    switch (customID) {
        case "suggestion-upvote": {
            if (votedUsers.find(u => u.user == interaction.user.id && u.type == "upvote")) {
                interaction.editReply({ content: "You already **up-voted** this suggestion", ephemeral: true });
            } else if (votedUsers.find(u => u.user == interaction.user.id && u.type == "downvote")) {
                votedUsers = votedUsers.filter(u => u.user != interaction.user.id);
                votedUsers.push({ user: interaction.user.id, type: "upvote" });
                await data.update({ votedUsers: JSON.stringify(votedUsers) });
                interaction.editReply({ content: "You **up-voted** this suggestion", ephemeral: true });
            } else if (!votedUsers.find(u => u.user == interaction.user.id)) {
                votedUsers.push({ user: interaction.user.id, type: "upvote" });
                await data.update({ votedUsers: JSON.stringify(votedUsers) });
                interaction.editReply({ content: "You **up-voted** this suggestion", ephemeral: true });
            };

            updateSuggestionMessageVoteAction(data, interaction);
            break;
        };

        case "suggestion-downvote": {
            if (votedUsers.find(u => u.user == interaction.user.id && u.type == "downvote")) {
                interaction.editReply({ content: "You already **down-voted** this suggestion", ephemeral: true });
            } else if (votedUsers.find(u => u.user == interaction.user.id && u.type == "upvote")) {
                votedUsers = votedUsers.filter(u => u.user != interaction.user.id);
                votedUsers.push({ user: interaction.user.id, type: "downvote" });
                await data.update({ votedUsers: JSON.stringify(votedUsers) });
                interaction.editReply({ content: "You **down-voted** this suggestion", ephemeral: true });
            } else if (!votedUsers.find(u => u.user == interaction.user.id)) {
                votedUsers.push({ user: interaction.user.id, type: "upvote" });
                await data.update({ votedUsers: JSON.stringify(votedUsers) });
                interaction.editReply({ content: "You **down-voted** this suggestion", ephemeral: true });
            }

            updateSuggestionMessageVoteAction(data, interaction);
            break;
        };

        case "suggestion-viewvoters": {
            if (!suggestionSystem.showVoters) {
                return interaction.editReply({ content: "Viewing voters is disabled", ephemeral: true });
            } else {
                return interaction.editReply({ content: `Coming soon...`, ephemeral: true });
            }
        }
    }
}