const fs = require('fs');
const ms = require('ms');
const path = require('path');

module.exports = {
    wait: (time) => new Promise(resolve => setTimeout(resolve, ms(time))),

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

    getChannel: (channel, guild) => {
        let _channel = guild.channels.cache.get(c => c.name === channel) || guild.channels.cache.get(c => c.id === channel);
        if(_channel) {
            return _channel;
        } else {
            return false;
        }
    },

    getRole: (role, guild) => {
        let _role = guild.roles.cache.get(r => r.name === role) || guild.roles.cache.get(r => r.id === role);
        if(_role) {
            return _role;
        } else {
            return false;
        }
    },

    findMember: async (memberId, guild) => {
        let _member = await guild.members.fetch(memberId);
        if(_member) {
            return _member;
        } else {
            return false;
        }
    }
}