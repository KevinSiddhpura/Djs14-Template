const chalk = require('chalk');

const formatMultiline = (prefix, message) => {
    return message.split('\n').map((line, index) => {
        return index === 0 ? `${prefix} ${line}` : `${' '.repeat(prefix.length)} ${line}`;
    }).join('\n');
}

module.exports = {
    system: (message) => {
        console.log(formatMultiline(chalk.green.bold('=[ SYSTEM ] •'), message));
    },
    info: (message) => {
        console.log(formatMultiline(chalk.cyan.bold('=[ INFO   ] •'), message));
    },
    warn: (message) => {
        console.log(formatMultiline(chalk.yellow.bold('=[ WARN   ] •'), message));
    },
    error: (message) => {
        console.log(formatMultiline(chalk.red.bold('=[ ERROR  ] •'), message));
    },
    update: (message) => {
        console.log(formatMultiline(chalk.magenta.bold('=[ UPDATE ] •'), message));
    }
}