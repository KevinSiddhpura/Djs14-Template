const fs = require('fs');
const path = require('path');

module.exports = {
    getFiles: (dir, onlyFolders = false) => {
        let _files = [];

        const files = fs.readdirSync(dir, {
            withFileTypes: true
        });

        for (const file of files) {
            const filePath = path.join(dir, file.name);

            if (onlyFolders) {
                if (file.isDirectory()) _files.push(filePath);
            } else {
                if (file.isFile()) _files.push(filePath);
            }
        }

        return _files;
    },

    getCommands: (excs = []) => {
        let commands = [];

        const folders = module.exports.getFiles(path.join(__dirname, "..", "commands"), true);

        for (const folder of folders) {
            const files = module.exports.getFiles(folder);
            for (const obj of files) {
                const cmdObject = require(obj);
                if (excs.includes(cmdObject.name)) continue;
                commands.push(cmdObject);
            }
        }

        return commands;
    },
}