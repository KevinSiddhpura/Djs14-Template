const fs = require("fs");

const errorFile = fs.createWriteStream("./data/errors.log", {
    flags: "a",
    encoding: "utf-8"
});

const formatErrorMessage = (error) => {
    const errorMessage = error instanceof Error ? error.stack || error.toString() : error;
    return errorMessage.replace(/\n/g, "\\n");
};

const logError = (type, error) => {
    const timeStamp = new Date().toISOString();
    const formattedError = formatErrorMessage(error);
    const logMessage = `${timeStamp} - ${type}: ${formattedError}\n\n`;
    errorFile.write(logMessage);

    const consoleMessage = `${type} • ${formattedError}`;
    console.log(consoleMessage);
}

module.exports = () => {
    process.on("uncaughtException", (error) => {
        logError("uncaughtException", error);
    });

    process.on("unhandledRejection", (reason) => {
        logError("unhandledRejection", reason);
    });
}
