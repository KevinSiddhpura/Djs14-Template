const chalk = require('chalk');

const formatMultiline = (prefix, message) => {
    return message.split('\n').map((line, index) => {
        return index === 0 ? `${prefix} ${line}` : `${''.repeat(prefix.length)} ${line}`;
    }).join('\n');
}

module.exports = {
    system: (message) => {
        console.log(formatMultiline(chalk.green.bold('=[ SYSTEM ] •'), message.toString()));
    },
    mysql: (message) => {
        console.log(formatMultiline(chalk.blue.bold('=[ MYSQL  ] •'), message.toString()));
    },
    info: (message) => {
        console.log(formatMultiline(chalk.cyan.bold('=[ INFO   ] •'), message.toString()));
    },
    warn: (message) => {
        console.log(formatMultiline(chalk.yellow.bold('=[ WARN   ] •'), message.toString()));
    },
    error: (message) => {
        console.log(formatMultiline(chalk.red.bold('=[ ERROR  ] •'), message.toString()));
    },
    update: (message) => {
        console.log(formatMultiline(chalk.gray.bold('=[ UPDATE ] •'), message.toString()));
    },
    music: (message) => {
        console.log(formatMultiline(chalk.magenta.bold('=[ MUSIC  ] •'), message.toString()));
    }
}