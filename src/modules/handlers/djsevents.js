const { getFiles } = require("../utils");
const path = require("path");

module.exports = async (client) => {
    const folders = getFiles(path.join(__dirname, "..", "..", "events"), true);

    for (const folder of folders) {
        const files = getFiles(folder);
        files.sort((a, b) => a > b);
        
        const name = folder.split(path.sep).pop();
        client.on(name, async (...args) => {
            for (const file of files) {
                const ev = require(file);
                await ev(client, ...args);
            }
        });
    }
}