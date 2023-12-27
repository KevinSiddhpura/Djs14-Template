const { OpenAI } = require("openai");
const config = require("../../../config");

if (!config.enableOpenAiSupport) return;

const openai = new OpenAI({
    apiKey: process.env.OPEN_AI_KEY,
});

module.exports = { openai };