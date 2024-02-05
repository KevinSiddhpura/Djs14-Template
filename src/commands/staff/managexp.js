const { ApplicationCommandOptionType, Client, CommandInteraction, EmbedBuilder, Colors, Message } = require("discord.js");
const { getDatabase } = require("../../modules/handlers/database");
const { updateXP } = require("../../modules/utils");
const logger = require("../../modules/logger");
const { Op } = require("sequelize");
const config = require("../../configs/config");

module.exports = {
    name: "manage-xp",
    category: "Staff",
    description: "Manage user xp",
    devOnly: false,
    disabled: false,
    channelOnly: ["commands"],
    roleRequired: ["Admin"],
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "increase",
            description: "Add xp to a user",
            options: [
                {
                    type: ApplicationCommandOptionType.User,
                    name: "user",
                    description: "Xp to add to",
                    required: true
                },
                {
                    type: ApplicationCommandOptionType.Integer,
                    name: "amount",
                    description: "Amount of xp to add",
                    required: true
                }
            ]
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "decrease",
            description: "Reduce xp from a user",
            options: [
                {
                    type: ApplicationCommandOptionType.User,
                    name: "user",
                    description: "Xp to remove from",
                    required: true
                },
                {
                    type: ApplicationCommandOptionType.Integer,
                    name: "amount",
                    description: "Amount of xp to be removed",
                    required: true
                }
            ]
        },
    ],

    /**
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     */

    runSlash: async (client, interaction) => {

        if (!config.createDbConnection || !config.levelSystem.enabled) {
            return interaction.reply({
                content: `Database connection is ${!config.createDbConnection ? "not enabled" : "enabled"}, Leveling system is ${!config.levelSystem.enabled ? "not enabled" : "enabled"}.`,
                ephemeral: true,
            });
        }

        await interaction.deferReply({ ephemeral: false });
        const user = interaction.options.getUser("user");
        const amount = interaction.options.getInteger("amount");

        if (amount <= 0) {
            return interaction.editReply("Amount must be greater than zero.");
        }

        const handleResponse = (operation, updated) => {
            if (!updated) {
                return interaction.editReply(`Something went wrong while ${operation} XP.`);
            }

            const title = `Leveling System • ${operation === 'add' ? 'Added' : 'Removed'} XP`;
            const embed = new EmbedBuilder()
                .setAuthor({ name: title, iconURL: client.user.displayAvatarURL() })
                .setColor(Colors.Aqua)
                .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                .setDescription(`> Updated XP for <@${user.id}>`)
                .setFields([{
                    name: "New XP",
                    value: `> **${updated.xp}**`,
                    inline: true,
                }, {
                    name: "New Level",
                    value: `> **${updated.level}**`,
                    inline: true,
                }])
                .setFooter({ text: `Updated by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

            return interaction.editReply({ embeds: [embed] });
        };

        try {
            const db = getDatabase("leveling");
            const user_data = await db.findOne({
                where: {
                    [Op.and]: [
                        {
                            user: user.id,
                            guild: interaction.guild.id
                        }
                    ],
                }
            });
            if (!user_data) return interaction.editReply("User not found in database.");
            const operation = interaction.options.getSubcommand() === "increase" ? "add" : "remove";
            if (operation == "remove") {
                if (user_data.xp - amount < 0) {
                    return interaction.editReply("User doesn't have enough xp.");
                };
            }
            const updated = await updateXP(db, user, operation == "add" ? "add" : "remove", amount, interaction.guild, true);
            return handleResponse(operation, updated);
        } catch (e) {
            logger.error(e);
            return interaction.editReply("An error occurred while updating XP.");
        };
    },

    /**
     * 
     * @param {Client} client 
     * @param {Message} message 
     * @param {Array} args 
     */

    runLegacy: async (client, message, args) => {
    }
}

