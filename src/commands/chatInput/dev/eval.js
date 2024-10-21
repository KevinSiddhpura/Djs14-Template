const { ApplicationCommandOptionType, Colors } = require("discord.js");
const Command = require("../../../handlers/helpers/command");
const logger = require("../../../handlers/helpers/logger");
const util = require("util");
const { createEmbeds } = require("../../../handlers/helpers/embed");

new Command({
    name: "eval",
    description: "Evaluate JS code.",
    devOnly: true,
    category: "Dev",
    options: [{
        type: ApplicationCommandOptionType.String,
        name: "code",
        description: "The code to evaluate.",
        required: true
    }],
    aliases: ["e"],
    runSlash: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: false });
        const inputCode = interaction.options.getString("code");

        await interaction.editReply({
            embeds: createEmbeds([{
                Title: "Evaluated Code",
                Description: "```Processing given code....```",
                Fields: [{
                    Name: "Input",
                    Value: `\`\`\`js\n${inputCode}\n\`\`\``,
                }],
                Color: Colors.Aqua,
                FooterIcon: interaction.user.displayAvatarURL({ dynamic: true }),
                FooterText: `Requested by ${interaction.user.username}`,
                Timestamp: true
            }])
        });

        try {
            let evaled = await eval(inputCode);

            if (typeof evaled !== "string") evaled = util.inspect(evaled, { depth: 1 });
            if (evaled.length > 4000) evaled = evaled.substring(0, 4000) + "...";
            await interaction.editReply({
                embeds: createEmbeds([{
                    Title: "Evaluated Code",
                    Description: `\`\`\`js\n${evaled}\n\`\`\``,
                    Fields: [{
                        Name: "Input",
                        Value: `\`\`\`js\n${inputCode}\n\`\`\``,
                    }],
                    Color: Colors.Aqua,
                    FooterIcon: interaction.user.displayAvatarURL({ dynamic: true }),
                    FooterText: `Requested by ${interaction.user.username}`,
                    Timestamp: true
                }])
            });
        } catch (error) {
            logger.error(error);
            await interaction.editReply({
                embeds: createEmbeds([{
                    Title: "Evaluated Code",
                    Description: `\`\`\`js\n${error}\n\`\`\``,
                    Fields: [{
                        Name: "Input",
                        Value: `\`\`\`js\n${inputCode}\n\`\`\``,
                    }],
                    Color: Colors.Red,
                    FooterIcon: interaction.user.displayAvatarURL({ dynamic: true }),
                    FooterText: `Requested by ${interaction.user.username}`,
                    Timestamp: true
                }])
            })
        }
    }
})