require("dotenv").config();
const { Client } = require("discord.js");
const eventHandler = require("./modules/handlers/eventHandler");
const config = require("../config.json");
const logger = require("./modules/logger");
const crashHandler = require("./modules/handlers/crashHandler");
const fs = require("fs");

if(!fs.existsSync("errors.log")) {
    fs.writeFileSync("errors.log", "");
};

const client = new Client({
    intents: 3243773,
    failIfNotExists: false
});

logger.system(`Attempting to start bot..`);

eventHandler(client);
crashHandler();

client.login(process.env.TOKEN).catch(e => console.error(e));

module.exports = { client, config };