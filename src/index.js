const logger = require("./modules/logger");
const crashHandler = require("./modules/handlers/crash");
crashHandler();

require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const djsHandler = require("./modules/handlers/discordjs");
const erelaHandler = require("./modules/handlers/erelajs");
const fs = require("fs");
const { createDatabaseConnection } = require("./modules/handlers/database");
const config = require("../config");
const { Manager } = require("erela.js");

if (!fs.existsSync("./data/errors.log")) {
    fs.writeFileSync("./data/errors.log", "");
};

const client = new Client({
    intents: Object.keys(GatewayIntentBits),
    failIfNotExists: false
});

djsHandler(client);
createDatabaseConnection();

let manager = false;
if (config.musicSupport.enabled) {
    manager = new Manager({
        autoPlay: true,
        clientId: config.botID,
        clientName: "Djs14",
        nodes: config.musicSupport.nodes,
        send: (id, payload) => {
            const guild = client.guilds.cache.get(id);
            if (guild) guild.shard.send(payload);
        }
    }).init(config.botID);
    
    client.on("raw", (d) => manager.updateVoiceState(d));
    erelaHandler(manager);
}

client.login(process.env.TOKEN).catch(e => logger.error(e));

module.exports = { client, manager };