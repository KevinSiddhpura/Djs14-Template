console.clear();
const logger = require("./modules/logger");
logger.system(`Attempting to start bot..`);
const crashHandler = require("./modules/handlers/crash");
crashHandler();

require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const eventHandler = require("./modules/handlers/events");
const fs = require("fs");
const { createDatabaseConnection } = require("./modules/handlers/database");

if (!fs.existsSync("./data/errors.log")) {
    fs.writeFileSync("./data/errors.log", "");
};

const client = new Client({
    intents: Object.keys(GatewayIntentBits),
    failIfNotExists: false
});

eventHandler(client);
createDatabaseConnection();

client.login(process.env.TOKEN).catch(e => console.error(e));

module.exports = { client };