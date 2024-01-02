const { ApplicationCommandOptionType, Client, CommandInteraction, EmbedBuilder, Colors } = require("discord.js");
const { openai } = require("../../modules/handlers/openAi");
const logger = require("../../modules/logger");
const { getDatabase } = require("../../modules/handlers/database");
const config = require("../../../config");
const utils = require("../../modules/utils");

const cleanIt = (text) => {
    if (typeof (text) === "string") {
        return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    } else {
        return text;
    }
}

module.exports = {
    name: "eval",
    category: "Admin",
    description: "Evaluates JavaScript code.",
    devOnly: true,
    disabled: false,
    channelOnly: [],
    roleRequired: [],
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: "code",
            description: "The code to evaluate.",
            required: true
        }
    ],
    execute: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: false });

        try {
            const code = interaction.options.getString("code");

            if (code.toLowerCase().includes("token")) {
                return interaction.editReply({ content: "Cannot run this code, asking for **Client Secret**" });
            };

            let evaled = await eval(code);
            if (typeof evaled !== "string") evaled = require("util").inspect(evaled);

            const MAX_CHARS = 4050;
            const output = cleanIt(evaled);

            const embeds = [];

            for (let i = 0; i < output.length; i += MAX_CHARS) {
                const chunk = output.substring(i, Math.min(output.length, i + MAX_CHARS));
                if (embeds.length === 0) {
                    const firstEmbed = new EmbedBuilder()
                        .setColor(Colors.Aqua)
                        .setFooter({
                            text: `Requested by ${interaction.user.username}`,
                            iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                        })
                        .addFields({ name: "Input", value: `\`\`\`js\n${cleanIt(code)}\n\`\`\`` })
                        .setDescription(`**Output:**\n\`\`\`js\n${chunk}\n\`\`\``)
                        .setTimestamp(Date.now());
                    embeds.push(firstEmbed);
                } else {
                    const continuedEmbed = new EmbedBuilder()
                        .setColor(Colors.Aqua)
                        .setDescription(`**Continued Output:**\n\`\`\`js\n${chunk}\n\`\`\``)
                        .setFields({ name: "Input", value: `\`\`\`js\n${cleanIt(code)}\n\`\`\`` })
                        .setFooter({
                            text: `Requested by ${interaction.user.username}`,
                            iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                        })
                        .setTimestamp(Date.now());
                    embeds.push(continuedEmbed);
                }
            }

            return interaction.editReply({ embeds: embeds });
        } catch (err) {
            return interaction.editReply({ content: `\`ERROR\` \`\`\`xl\n${cleanIt(err)}\n\`\`\`` });
        }
    }

}