const { Client } = require("discord.js");
const chalk = require("chalk");
const logger = require("../../../modules/logger");
const timedMod = require("../../../modules/handlers/timedMod");
const ms = require("ms");
const config = require("../../../../config");

/**
 * @param {Client} client 
 */

module.exports = async (client) => {
    logger.info(`Logged in as ${chalk.bold.underline(client.user.username)}!`);
  
    if (config.createDbConnection) {
        setTimeout(() => {
            timedMod().then(() => {
                setInterval(() => {
                    timedMod()
                }, ms("2m"));
            })
        }, ms("5s"));
    }
}