const { Client, MessageContextMenuCommandInteraction, ApplicationCommandType, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const createEmbed = require("../modules/handlers/createEmbed");
const { addBlackSpace, paste } = require("../modules/utils");

module.exports = {
    enabled: true,
    type: ApplicationCommandType.Message,
    name: "Message Info",
    description: "Get information about a message",
    devOnly: false,
    adminOnly: false,
    allowedChannels: [],
    allowedRoles: [],

    /**
     * 
     * @param {Client} client 
     * @param {MessageContextMenuCommandInteraction} interaction 
     */

    runContext: async (client, interaction) => {
        const message = await interaction.channel.messages.fetch(interaction.targetId);

        const layout = [
            "=== General ===",
            "",
            JSON.stringify(message, null, 2),
            "",
            "=== Content ===",
            "",
            JSON.stringify(message.content, null, 2),
            "",
            "=== Embeds ===",
            "",
            JSON.stringify(message.embeds, null, 2),
            "",
            "=== Attachments ===",
            JSON.stringify(message.attachments, null, 2),
        ].join("\n")

        const pastedRes = await paste(layout);
        const embeds = [
            createEmbed({
                Title: "Message Information",
                Description: [
                    `> **System Message** • \`${message.system ? "True" : "False"}\``,
                    `> **Message ID** • \`${message.id}\``,
                    `> **Channel** • <#${message.channel.id}> (\`${message.channel.id}\`)`,
                    `- **Author** • <@${message.author.id}> (\`${message.author.id}\`)`,
                    `- **Message Sent** • <t:${(message.createdAt / 1000).toFixed(0)}:R>`,
                    "```",
                    "- Contains Content • " + (message.content ? "True" : "False"),
                    "- Contains Embeds • " + (message.embeds.length > 0 ? "True" : "False"),
                    "- Contains Attachments • " + (message.attachments.size > 0 ? "True" : "False"),
                    "```"
                ].join("\n"),
                Timestamp: true,
                Footer: `Requested by ${interaction.user.username}`,
                FooterIcon: interaction.user.displayAvatarURL({ dynamic: true }),
                Color: "Blue"
            })
        ]

        await interaction.reply({
            components: [
                new ActionRowBuilder()
                    .setComponents([
                        new ButtonBuilder()
                            .setLabel("Detailed Information")
                            .setStyle("Link")
                            .setURL(pastedRes)
                            .setEmoji("📋")
                    ]),
            ],
            embeds,
            ephemeral: true
        })
    }
}