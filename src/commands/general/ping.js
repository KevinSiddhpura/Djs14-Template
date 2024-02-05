const { Client, CommandInteraction, EmbedBuilder, Message } = require("discord.js");

module.exports = {
    name: "ping",
    category: "General",
    description: "Get the bot's ping and ws latency.",
    devOnly: false,
    disabled: false,
    channelOnly: [],
    roleRequired: [],
    options: [],

    /**
     * 
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     * @returns 
     */

    runSlash: async (client, interaction) => {

        await interaction.deferReply({ ephemeral: true });
        const repTime = await interaction.fetchReply();

        return interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Ping Pong!")
                    .setDescription(`- **Latency** • \`${repTime.createdTimestamp - interaction.createdTimestamp}ms\` \n- **API Latency** • \`${Math.floor(client.ws.ping)}ms\``)
                    .setFooter({
                        text: `Requested by ${interaction.user.username}`,
                        iconURL: interaction.user.displayAvatarURL()
                    })
                    .setThumbnail(client.user.displayAvatarURL())
                    .setTimestamp(Date.now())
                    .setColor("Aqua")
            ]
        })
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