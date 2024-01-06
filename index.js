const logger = require("./src/modules/logger");
const crashHandler = require("./src/modules/handlers/crash");
const fs = require("fs");
const { Client, GatewayIntentBits } = require("discord.js");
const { createDatabaseConnection } = require("./src/modules/handlers/database");
const { Manager } = require("erela.js");
const [AppleMusic, Facebook, Deezer, Spotify] = ["erela.js-apple", "erela.js-facebook", "erela.js-deezer", "erela.js-spotify"].map(require);

require("dotenv").config();
const config = require("./src/configs/config");
const musicSystem = require("./src/configs/musicSystem");
const levelingSystem = require("./src/configs/levelingSystem");
const suggestionSystem = require("./src/configs/suggestionSystem");
const ticketSystem = require("./src/configs/ticketSystem");

// Log the bot starting process
logger.system("Attempting to start bot, might take some time");

// Handle potential crashes
crashHandler();

// Set up the client with Gateway Intent Bits
const client = new Client({ intents: Object.keys(GatewayIntentBits), failIfNotExists: false });

// Create database connection if needed
if (config.createDbConnection) createDatabaseConnection();

// Initialize music system if enabled   
let manager;
if (musicSystem.enabled) {
    const playerPlugins = [new AppleMusic(), new Facebook(), new Deezer()];
    if (config.musicSystem.spotify.enabled) {
        playerPlugins.push(new Spotify(config.musicSystem.spotify));
    }

    manager = new Manager({
        autoPlay: true,
        clientId: config.botID,
        clientName: "Djs14",
        nodes: musicSystem.nodes,
        plugins: playerPlugins,
        send: (id, payload) => {
            const guild = client.guilds.cache.get(id);
            if (guild) guild.shard.send(payload);
        }
    }).init(config.botID);

    require("./modules/handlers/erelaHandler")(manager);
}

// Ensure errors.log exists
if (!fs.existsSync("./data/errors.log")) {
    fs.writeFileSync("./data/errors.log", "");
}

// Client login
client.login(process.env.TOKEN).catch(e => logger.error(e));

// Export modules
module.exports = { client, manager, config, musicSystem, levelingSystem, suggestionSystem, ticketSystem };
