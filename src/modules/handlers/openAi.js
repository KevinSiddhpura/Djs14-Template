const { OpenAI } = require("openai");
const config = require("../../../config.json");

if (!config.openAi) return;

const openai = new OpenAI({
    apiKey: process.env.OPEN_AI_KEY,
});

module.exports = { openai };