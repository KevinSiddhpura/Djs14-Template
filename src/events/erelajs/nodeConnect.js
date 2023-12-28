const logger = require("../../modules/logger")

module.exports = (manager, node) => {
    logger.music(`Node ${node.options.identifier} has been connected!`);
}