const fs = require("fs");
const logger = require("../logger");

const errorFile = fs.createWriteStream("./data/errors.log", {
    flags: "a",
    encoding: "utf-8"
});

const formatErrorMessage = (error) => {
    return error.replace(/\n/g, "\\n");
};

const logError = (type, error) => {
    const timeStamp = new Date().toISOString();
    const formattedError = formatErrorMessage(error.stack || error.toString());
    const logMessage = `${timeStamp} - ${type}: ${formattedError}\n\n`;
    errorFile.write(logMessage);

    if (type === "uncaughtException") {
        logger.error(`UncaughtException • ${formattedError}`);
    } else if (type === "unhandledRejection") {
        logger.error(`UnhandledRejection • ${formattedError}`);
    }
}

module.exports = () => {
    process.on("uncaughtException", (error, origin) => {
        logError("uncaughtException", error);
    });

    process.on("unhandledRejection", (reason) => {
        logError("unhandledRejection", reason);
    });
}
