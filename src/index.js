const { Client, GatewayIntentBits, Collection } = require("discord.js");
const djsevents = require("./modules/handlers/djsevents");
const Database = require("./modules/handlers/database");
const env = require("dotenv");
env.config();

const db = new Database({
    name: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

const commands = new Collection();
const client = new Client({
    intents: Object.keys(GatewayIntentBits)
});

(async () => {
    await db.createConnection();
    await djsevents(client);
})();

client.login(process.env.TOKEN);

process.on("uncaughtException", (error, origin) => {
    console.log("uncaughtException", error, origin);
});

process.on("unhandledRejection", (reason) => {
    console.log("unhandledRejection", reason);
});

module.exports = { client, db, commands };