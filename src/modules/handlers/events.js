const { getFiles } = require("../utils");
const path = require("path");

module.exports = (client) => {
    const folders = getFiles(path.join(__dirname, "..", "..", "events"), true);

    for (const folder of folders) {
        const files = getFiles(folder);
        files.sort((a, b) => a > b);

        const name = folder.replace(/\\/g, '/').split('/').pop();
        client.on(name, async (args) => {
            for (const file of files) {
                const evFunction = require(file);
                evFunction(client, args);
            }
        })
    }
}