const chalk = require("chalk");
const logger = require("../../modules/logger")

module.exports = (client) => {
    logger.info(`Logged in as ${chalk.bold.underline(client.user.username)}!`);
}