const { Client, GatewayIntentBits } = require("discord.js");
const { config } = require("dotenv");
const { requireCommands } = require("./handlers/utils");
const runEvents = require("./handlers/helpers/runEvents");
const logger = require("./handlers/helpers/logger");
const { mongoConnection } = require("./handlers/db");

config();
requireCommands();

const client = new Client({
    intents: Object.keys(GatewayIntentBits)
});

const promises = [
    mongoConnection(),
    runEvents(client)
]

Promise.allSettled(promises).catch(logger.error);
client.login(process.env.TOKEN);

process.on("unhandledRejection", (err) => {
    logger.error(err);
});

process.on("uncaughtException", (err) => {
    logger.error(err);
});

module.exports = client