const logger = require("../../modules/logger")

module.exports = (node) => {
    logger.music(`Node ${node.options.identifier} has been connected!`);
}