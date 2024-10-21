const Utils = require("../utils");
const path = require("path");

module.exports = async (client) => {
    const eventFolders = Utils.getFiles(path.join(__dirname, "../../events"), true);
    for (const folder of eventFolders) {
        const eventName = folder.split(path.sep).pop().split(".")[0];

        const files = Utils.getFiles(folder);
        files.sort((a, b) => b - a);

        for (const file of files) {
            if (!file.endsWith(".js")) continue;
            const event = require(file);
            if (event.once) {
                client.once(eventName, (...args) => event.run(client, ...args));
            } else {
                client.on(eventName, (...args) => event.run(client, ...args));
            }
        }
    };
}