const { manager } = require("../..");
const logger = require("../../modules/logger")

module.exports = (player, oldChannel, newChannel) => {
    console.log('Player:', player);
    console.log('Old Channel:', oldChannel);
    console.log('New Channel:', newChannel);
};
