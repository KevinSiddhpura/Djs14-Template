const musicSystem = require("../../configs/musicSystem");
const { getFiles } = require("../utils");
const path = require("path");

if (!musicSystem.enabled) return;

module.exports = (manager) => {
    const files = getFiles(path.join(__dirname, "..", "..", "events", "erelajs"), false);

    for (const file of files) {
        const name = file.replace(/\\/g, '/').split('/').pop().split('.').shift();
        manager.on(name, async (...args) => {
            const evFunction = require(file);
            evFunction(manager, ...args);
        });
    }
}