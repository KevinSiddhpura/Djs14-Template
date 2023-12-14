console.clear();
const crashHandler = require("./modules/handlers/crashHandler");
crashHandler();

require("dotenv").config();
const { Client } = require("discord.js");
const eventHandler = require("./modules/handlers/eventHandler");
const config = require("../config.json");
const logger = require("./modules/logger");
const fs = require("fs");
const { createDatabaseConnection, getDatabase } = require("./modules/handlers/database");

if(!fs.existsSync("errors.log")) {
    fs.writeFileSync("errors.log", "");
};

const client = new Client({
    intents: 3243773,
    failIfNotExists: false
});


logger.system(`Attempting to start bot..`);
eventHandler(client);

if(config.database.createConnection) {
    createDatabaseConnection();
}

client.login(process.env.TOKEN).catch(e => console.error(e));

module.exports = { client, config };