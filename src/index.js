const logger = require("./modules/logger");
logger.system("Attempting to start bot, might take some time");
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
const AppleMusic = require("erela.js-apple");
const Facebook = require("erela.js-facebook");
const Deezer = require("erela.js-deezer");
const Spotify = require("erela.js-spotify");

if (!fs.existsSync("./data/errors.log")) {
    fs.writeFileSync("./data/errors.log", "");
};

const client = new Client({
    intents: Object.keys(GatewayIntentBits),
    failIfNotExists: false
});

djsHandler(client);
createDatabaseConnection();

/**@type {Manager} */
let manager;
if (config.musicSupport.enabled) {

    const playerPlugins = [
        new AppleMusic(),
        new Facebook(),
        new Deezer()
    ];
    
    if(config.musicSupport.spotify.enabled) {
        playerPlugins.push(new Spotify({
            clientID: config.musicSupport.spotify.clientID,
            clientSecret: config.musicSupport.spotify.clientSecret,
        }));
    }

    manager = new Manager({
        autoPlay: true,
        clientId: config.botID,
        clientName: "Djs14",
        nodes: config.musicSupport.nodes,
        plugins: [...playerPlugins],
        send: (id, payload) => {
            const guild = client.guilds.cache.get(id);
            if (guild) guild.shard.send(payload);
        }
    }).init(config.botID);
    erelaHandler(manager);
}

client.login(process.env.TOKEN).catch(e => logger.error(e));

module.exports = { client, manager };