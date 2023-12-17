const { ApplicationCommandOptionType, Client, CommandInteraction } = require("discord.js");
const { openai } = require("../../modules/openAi");
const logger = require("../../modules/logger");
const { wait } = require("../../modules/utils");
const { config } = require("../..");

module.exports = {
    name: "openai",
    category: "General",
    description: "Get response from OpenAI",
    devOnly: false,
    disabled: false,
    roleRequired: false,
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: "prompt",
            description: "The prompt to send to OpenAI",
            required: true,
        },
        {
            type: ApplicationCommandOptionType.String,
            name: "model",
            description: "Model to use for generating response",
            choices: [
                {
                    name: "🟢 GPT-3.5 Turbo",
                    value: "gpt-3.5-turbo",      
                },
                {
                    name: "🟡 GPT-4",
                    value: "gpt-4",
                }
            ],
            required: false,
        }
    ],
    execute: async (/**@type {Client} */ client, /**@type {CommandInteraction} */ interaction) => {

        if(!config.openAi) {
            return interaction.reply({ content: "OpenAI module is disabled", ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: false });
        const prompt = interaction.options.getString("prompt");
        const respModel = interaction.options.getString("model") || "gpt-3.5-turbo";

        await interaction.editReply({ content: `🤖 <@${interaction.user.id}>, please wait generating response can take up to 1 minute` });

        await interaction.channel.sendTyping().catch(() => {});
        await wait("2s");

        try {
            const oldMsgs = await fetchPreviousMessages(interaction, client);
            oldMsgs.push(createMessageObject('user', prompt, interaction.user.username));

            const response = await openai.chat.completions.create({
                model: respModel,
                messages: oldMsgs,
            });

            const resMsg = response.choices[0].message.content;
            const charLim = 1500;
            await handleResponse(interaction, resMsg, charLim);
        } catch (error) {
            logger.error(error);
            await interaction.editReply({
                content: `<@${interaction.user.id}>, an error occurred: ${error.message}`,
            });
        }
    }
}

async function fetchPreviousMessages(interaction, client) {
    const prevMsgs = await interaction.channel.messages.fetch({ limit: 10 });
    return prevMsgs.reverse().map(msg => {
        if (msg.author.bot && msg.author.id !== client.user.id) return;
        const role = msg.author.id === client.user.id ? "assistant" : "user";
        return createMessageObject(role, msg.content, msg.author.username);
    }).filter(Boolean);
}

function createMessageObject(role, content, name) {
    return { role, content, name };
}

async function handleResponse(interaction, resMsg, charLim) {
    if (resMsg.length <= charLim) {
        await interaction.editReply({ content: resMsg });
    } else {
        await interaction.editReply({ content: resMsg.substring(0, charLim) });
        for (let i = charLim; i < resMsg.length; i += charLim) {
            const msg = resMsg.substring(i, Math.min(i + charLim, resMsg.length));
            await interaction.followUp({ content: msg });
        }
    }
}
