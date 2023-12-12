const { Client, CommandInteraction, EmbedBuilder } = require("discord.js");
const { getCommands } = require("../../modules/utils");

module.exports = {
    name: "ping",
    category: "Utility",
    description: "Get the bot's ping and ws latency.",
    devOnly: false,
    disabled: false,
    roleRequired: false,
    options: [],
    execute: async (/**@type {Client} */ client, /**@type {CommandInteraction} */ interaction) => {

        await interaction.deferReply({ ephemeral: false });

        const repTime = await interaction.fetchReply();

        interaction.editReply({
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