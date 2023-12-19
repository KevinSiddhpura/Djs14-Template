const chalk = require("chalk");
const logger = require("../../modules/logger");
const timedMod = require("../../modules/handlers/timedMod");
const ms = require("ms");

module.exports = (client) => {
    logger.info(`Logged in as ${chalk.bold.underline(client.user.username)}!`);

    setTimeout(() => {
        timedMod().then(() => {
            setInterval(() => {
                timedMod()
            }, ms("2m"));
        })
    }, ms("10s"));
}