const { Client, ChatInputCommandInteraction, Message, ApplicationCommandOptionType } = require("discord.js");
const createEmbed = require("../../modules/handlers/createEmbed");
const config = require("../../constants");
const utils = require("../../modules/utils");
const util = require("util");

module.exports = {
    enabled: true,
    name: "eval",
    description: "Evaluates JS code",
    devOnly: true,
    adminOnly: false,
    aliases: ["e"],
    allowedChannels: [],
    allowedRoles: [],
    options: [{
        type: ApplicationCommandOptionType.String,
        name: "code",
        description: "The code to evaluate",
        required: true
    }],

    /**
     * 
     * @param {Client} client 
     * @param {ChatInputCommandInteraction} interaction 
     */

    runSlash: async (client, interaction) => {
        await interaction.deferReply();
        const inputCode = interaction.options.getString("code");

        const embed = createEmbed({
            Title: "Evaluate JS",
            Description: "```Processing given code....```",
            Fields: [{
                Name: "Input",
                Value: `\`\`\`js\n${inputCode}\n\`\`\``,
            }],
            Footer: `Requester ${interaction.user.username}`,
            Timestamp: true
        });

        await interaction.editReply({ embeds: [embed] });

        try {
            let evaled = eval(inputCode);
            if (evaled instanceof Promise) evaled = await evaled;
            if (typeof evaled !== "string") evaled = util.inspect(evaled, { depth: 1 });
            if (evaled.length > 4000) evaled = evaled.substring(0, 4000) + "...";

            embed.setDescription(`\`\`\`js\n${evaled}\n\`\`\``);
            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            embed.setDescription(`\`\`\`js\n${error}\n\`\`\``).setColor("Red");
            await interaction.editReply({ embeds: [embed] });
        }
    },

    /**
     * 
     * @param {Client} client 
     * @param {Message} message 
     * @param {Array} args 
     */

    runLegacy: async (client, message, args) => {
        const inputCode = args.join(" ");

        const embed = createEmbed({
            Title: "Evaluate JS",
            Description: "```Processing given code....```",
            Fields: [{
                Name: "Input",
                Value: `\`\`\`js\n${inputCode}\n\`\`\``,
            }],
            Footer: `Requester ${message.author.username}`,
            Timestamp: true
        });

        const mainMessage = await message.reply({ embeds: [embed] });

        try {
            let evaled = eval(inputCode);
            if (evaled instanceof Promise) evaled = await evaled;
            if (typeof evaled !== "string") evaled = util.inspect(evaled, { depth: 1 });
            if (evaled.length > 4000) evaled = evaled.substring(0, 4000) + "...";

            embed.setDescription(`\`\`\`js\n${evaled}\n\`\`\``);
            await mainMessage.edit({ embeds: [embed] });
        } catch (error) {
            embed.setDescription(`\`\`\`js\n${error}\n\`\`\``).setColor("Red");
            await mainMessage.edit({ embeds: [embed] });
        }
    }
}