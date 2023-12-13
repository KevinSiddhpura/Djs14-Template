const { ApplicationCommandOptionType, Client, CommandInteraction } = require("discord.js");
const { config, client } = require("../..");

const cleanIt = (text) => {
    if (typeof (text) === "string") {
        return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    } else {
        return text;
    }
}

module.exports = {
    name: "eval",
    category: "Developer",
    description: "Evaluates JavaScript code.",
    devOnly: true,
    disabled: false,
    roleRequired: false,
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: "code",
            description: "The code to evaluate.",
            required: true
        }
    ],
    execute: async (/**@type {Client} */ client, /**@type {CommandInteraction} */ interaction) => {
        await interaction.deferReply({ ephemeral: false });

        try {
            const code = interaction.options.getString("code");

            if (code.toLowerCase().includes("token")) {
                return interaction.editReply({ content: "Can not run this code, asking for **Client Secret**" });
            };

            let evaled = await eval(code);

            if (typeof evaled !== "string") evaled = require("util").inspect(evaled);
            return interaction.editReply({ content: `\`\`\`xl\n${cleanIt(evaled)}\n\`\`\`` });
        } catch (err) {
            return interaction.editReply({ content: `\`ERROR\` \`\`\`xl\n${cleanIt(err)}\n\`\`\`` });
        }
    }
}