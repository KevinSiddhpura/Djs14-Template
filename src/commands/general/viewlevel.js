const { ApplicationCommandOptionType, Client, CommandInteraction, EmbedBuilder, Colors, Message } = require("discord.js");
const { getDatabase } = require("../../modules/handlers/database");
const config = require("../../configs/config");
const levelingSystem = require("../../configs/levelingSystem");

module.exports = {
    name: "level",
    category: "General",
    description: "View user xp/level",
    devOnly: false,
    disabled: false,
    channelOnly: ["commands"],
    roleRequired: ["Members"],
    options: [
        {
            type: ApplicationCommandOptionType.User,
            name: "user",
            description: "Mention the user",
            required: false,
        }
    ],

    /**
     * 
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     * @returns 
     */

    runSlash: async (client, interaction) => {

        if (!config.createDbConnection) {
            return interaction.reply({
                content: "Database connection is disabled!",
                ephemeral: true,
            })
        };

        if (!levelingSystem.enabled) {
            return interaction.reply({
                content: "Leveling system is disabled!",
                ephemeral: true,
            })
        }

        await interaction.deferReply({ ephemeral: true });

        const db = getDatabase("leveling");
        const _user = interaction.options.getUser("user") || interaction.user;
        const data = await db.findOne({
            where: { user: _user.id },
        });

        if (!data) {
            return interaction.reply({
                content: "User has no data!",
                ephemeral: true,
            })
        };

        const { user, xp, level, messages } = data;

        const nextLevelXp = levelingSystem.levelXp[level + 1] || "Max Level Reached";
        const xpToNextLevel = nextLevelXp === "Max Level Reached" ? nextLevelXp : nextLevelXp - xp;

        let lvlUpMsg = "";
        if (xpToNextLevel !== "Max Level Reached") {
            lvlUpMsg = `Level up in **${xpToNextLevel}**`;
        } else {
            lvlUpMsg = `__**${xpToNextLevel}**__`;
        }

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setAuthor({
                        name: "Leveling System",
                        iconURL: client.user.displayAvatarURL(),
                    })
                    .setColor(Colors.Aqua)
                    .setDescription(`> Showing data for <@${_user.id}> \n- ${lvlUpMsg}`)
                    .setFields([{
                        name: "Current Xp",
                        value: `> **${xp}**`,
                        inline: true,
                    }, {
                        name: "Current Level",
                        value: `> **${level}**`,
                        inline: true,
                    }, {
                        name: "Messages Sent",
                        value: `> **${messages}**`,
                        inline: true,
                    }])
                    .setThumbnail(_user.displayAvatarURL({ dynamic: true }))
                    .setFooter({
                        text: `Requested by ${interaction.user.username}`,
                        iconURL: interaction.user.displayAvatarURL(),
                    })
            ],
        });
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