const { ApplicationCommandType, Colors } = require("discord.js");
const { Command } = require("../../../handlers/helpers/command");
const { createEmbed } = require("../../../handlers/helpers/embed");

module.exports = new Command({
    name: "Message Info",
    type: ApplicationCommandType.Message,
    category: "Context-Message",
    runContextMessage: async (client, interaction) => {
        const message = interaction.targetMessage;

        return interaction.reply({
            embeds: createEmbed([{
                Title: "Message Info",
                Color: Colors.Aqua,
                Description: [
                    `- **Sent By: ** <@${message.author.id}> (${message.author.id})`,
                    `- **Sent In: ** <#${interaction.channel.id}> (${interaction.channel.id})`,
                    `- **Embeds: ** ${message.embeds.length || "None"}`,
                    `- **Attachments: ** ${message.attachments.size || "None"}`,
                    `- **Reactions: ** ${message.reactions.cache.size || "None"}`,
                    `- **Message Content:**`,
                    "```",
                    `${message.content || "None"}`,
                    "```",
                ].join("\n"),
                FooterText: `ID: ${message.id}`,
                FooterIcon: message.author.displayAvatarURL({ dynamic: true }),
                Timestamp: true
            }])
        })
    }
})