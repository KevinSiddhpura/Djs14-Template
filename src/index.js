const { initialize } = require("./handlers/helpers/database");
initialize();

const { config } = require("dotenv");
config();

const { Client, GatewayIntentBits } = require("discord.js");
const runEvents = require("./handlers/helpers/runEvents");
const logger = require("./handlers/helpers/logger");
const Utils = require("./handlers/utils");
Utils.requireCommands();

const client = new Client({
    intents: Object.keys(GatewayIntentBits)
});

runEvents(client);

client.login(process.env.TOKEN);

process.on("unhandledRejection", (err) => {
    logger.error(err);
});

process.on("uncaughtException", (err) => {
    logger.error(err);
});

module.exports = client