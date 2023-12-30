const { Client, CommandInteraction, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "ping",
    category: "General",
    description: "Get the bot's ping and ws latency.",
    devOnly: false,
    disabled: false,
    channelOnly: [],
    roleRequired: [],
    options: [],
    execute: async (/**@type {Client} */ client, /**@type {CommandInteraction} */ interaction) => {

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
    }
}