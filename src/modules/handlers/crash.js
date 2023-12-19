const fs = require("fs");
const logger = require("../logger");

const errorFile = fs.createWriteStream("./data/errors.log", {
    encoding: "utf-8"
});

const logError = (type, error) => {
    logger.error(error);
    const timeStamp = new Date().toISOString();
    if (type === "uncaughtException") {
        const logMessage = `${timeStamp} - ${type}: ${error}\n\n`;
        errorFile.write(logMessage);
    } else if (type === "unhandledRejection") {
        const logMessage = `${timeStamp} - ${type}: ${error}\n\n`;
        errorFile.write(logMessage);
    }
}

module.exports = () => {
    process.on("uncaughtException", (error, origin) => {
        logError("uncaughtException", error.stack);
    });

    process.on("unhandledRejection", (reason) => {
        logError("unhandledRejection", reason);
    })
}