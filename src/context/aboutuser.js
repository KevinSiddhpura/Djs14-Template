const { Client, UserContextMenuCommandInteraction, ApplicationCommandType, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const createEmbed = require("../modules/handlers/createEmbed");
const { addSpace, paste } = require("../modules/utils");

module.exports = {
    enabled: true,
    type: ApplicationCommandType.User,
    name: "About User",
    description: "Get information about a user",
    devOnly: false,
    adminOnly: false,
    allowedChannels: [],
    allowedRoles: ["Members"],

    /**
     * 
     * @param {Client} client 
     * @param {UserContextMenuCommandInteraction} interaction 
     */

    runContext: async (client, interaction) => {
        const user = interaction.targetUser;
        const member = interaction.guild.members.cache.get(user.id);

        const layout = [
            "=== User Info ===",
            "",
            JSON.stringify(user, null, 2),
            "",
            "=== Member Info ===",
            "",
            JSON.stringify(member, null, 2),
        ].join("\n")

        const pastedRes = await paste(layout);
        const roles = member.roles.cache.map(r => r.id).filter(r => r !== interaction.guild.id).map(r => `<@&${r}>`)
        const embeds = [
            createEmbed({
                Title: "User Information",
                Thumbnail: user.displayAvatarURL({ dynamic: true }),
                Description: [
                    `> **${addSpace("Is Bot", 10)}** • \`${user.bot ? "`Yes`" : "`No`"}\``,
                    `> **Username** • \`${user.username}\``,
                    `> **${addSpace("User ID", 7)}** • \`${user.id}\``,
                    `- **Account Created** • <t:${(user.createdAt / 1000).toFixed(0)}:R>`,
                    `- **${addSpace("Server Joined", 6)}** • <t:${(member.joinedAt / 1000).toFixed(0)}:R>`,
                ].join("\n"),
                Fields: [{
                    Name: "Member Roles",
                    Value: roles.length == 0 ? "> Mentioned member has no roles" : `>>> ${roles.splice(0, 30).join(", ")}`,
                }],
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