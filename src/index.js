const logger = require("./modules/logger");
logger.system("Attempting to start bot, might take some time");
const crashHandler = require("./modules/handlers/crash");
crashHandler();

require("dotenv").config();
const config = require("./configs/config");
const musicSystem = require("./configs/musicSystem");

const fs = require("fs");
const { Client, GatewayIntentBits } = require("discord.js");
const { createDatabaseConnection } = require("./modules/handlers/database");

const { Manager } = require("erela.js");
const AppleMusic = require("erela.js-apple");
const Facebook = require("erela.js-facebook");
const Deezer = require("erela.js-deezer");
const Spotify = require("erela.js-spotify");

const djsHandler = require("./modules/handlers/discordjs");
const erelaHandler = require("./modules/handlers/erelajs");

if (!fs.existsSync("./data/errors.log")) {
    fs.writeFileSync("./data/errors.log", "");
};

const client = new Client({
    intents: Object.keys(GatewayIntentBits),
    failIfNotExists: false
});

djsHandler(client);
if(config.createDbConnection) createDatabaseConnection();

/**@type {Manager} */
let manager;
if (musicSystem.enabled) {

    const playerPlugins = [
        new AppleMusic(),
        new Facebook(),
        new Deezer()
    ];
    
    if(musicSystem.spotify.enabled) {
        playerPlugins.push(new Spotify({
            clientID: musicSystem.spotify.clientID,
            clientSecret: musicSystem.spotify.clientSecret,
        }));
    }

    manager = new Manager({
        autoPlay: true,
        clientId: config.botID,
        clientName: "Djs14",
        nodes: musicSystem.nodes,
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