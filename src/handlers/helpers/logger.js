const { default: chalk } = require('chalk');

const logger = {
    error(...args) {
        const prefix = chalk.bold.red("[ERROR] =>")
        console.error(prefix, ...args);
    },
    info(...args) {
        const prefix = chalk.bold.green("[INFO ] =>")
        console.info(prefix, ...args);
    },
    warn(...args) {
        const prefix = chalk.bold.yellow("[WARN ] =>")
        console.error(prefix, ...args);
    },
    debug(...args) {
        const prefix = chalk.bold.magenta("[DEBUG] =>")
        console.error(prefix, ...args);
    }
}

module.exports = logger;