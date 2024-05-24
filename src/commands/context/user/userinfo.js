const { ApplicationCommandType, Colors } = require("discord.js");
const { Command } = require("../../../handlers/helpers/command");
const { createEmbed } = require("../../../handlers/helpers/embed");

new Command({
    name: "User Info",
    type: ApplicationCommandType.User,
    runContextUser: async (client, interaction) => {
        const user = interaction.targetMember;

        return interaction.reply({
            embeds: createEmbed([{
                Title: "User Info",
                Color: Colors.Aqua,
                Description: [
                    `> **User: ** <@${user.user.id}> (\`${user.user.username}\`)`,
                    `> **Joined Server**: <t:${(user.joinedAt / 1000).toFixed(0)}:R>`,
                    `> **Joined Discord**: <t:${(user.user.createdTimestamp / 1000).toFixed(0)}:R>`,
                ].join("\n"),
                FooterText: `ID: ${user.user.id}`,
                FooterIcon: user.user.displayAvatarURL({ dynamic: true }),
                Timestamp: true
            }])
        })
    }
})