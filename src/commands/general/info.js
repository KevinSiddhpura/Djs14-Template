const { Client, ChatInputCommandInteraction, Message, User } = require("discord.js");
const createEmbed = require("../../modules/handlers/createEmbed");
const package = require("../../../package.json");

/**
 * 
 * @param {Client} client 
 * @param {User} user 
 */

function getEmbed (client, user) {
    return createEmbed({
        Title: "Djs-V14 Information",
        Description: [
            `- **Template Version** • \`${package.version}\``,
            `- **Repository Author** • \`${package.author}\``,
            `> A beginner friendly **Discord Bot** template with helpfull utils`,
            `> Better discord events management`,
            `> Also includes database utils (mysql)`,
            `- **GitHub Repository** • [\`Click Here\`](${package.repository.url})`,
            `- **GitHub Issues** • [\`Click Here\`](${package.repository.issues})`,
            `- **GitHub Discussion** • [\`Click Here\`](${package.repository.discussion})`,
        ].join("\n"),
        Footer: `Requested by ${user.username}`,
        FooterIcon: user.displayAvatarURL({ dynamic: true }),
        Timestamp: true,
        Image: "https://repository-images.githubusercontent.com/730859567/6247dad3-fb39-4021-a35a-f08341e1f13a"
    })
}

module.exports = {
    enabled: true,
    name: "info",
    description: "Shows information about the bot",
    devOnly: false,
    adminOnly: false,
    aliases: ["i"],
    allowedChannels: [],
    allowedRoles: [],
    options: [],

    /**
     * 
     * @param {Client} client 
     * @param {ChatInputCommandInteraction} interaction 
     */

    runSlash: async (client, interaction) => {
        await interaction.reply({ embeds: [getEmbed(client, interaction.user)] });
    },

    /**
     * 
     * @param {Client} client 
     * @param {Message} message 
     * @param {Array} args 
     */

    runLegacy: async (client, message, args) => {
        await message.reply({ embeds: [getEmbed(client, message.author)] });
    }
}