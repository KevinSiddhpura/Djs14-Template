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

    getChannel: async (channel, guild) => {
        const channels = await guild.channels.fetch();
        let _channel = channels.find(c => c.id === channel);
        if (!_channel) _channel = channels.find(c => c.name === channel);
        return _channel || false;
    },

    getRole: async (role, guild) => {
        const roles = await guild.roles.fetch();
        let _role = roles.find(r => r.id === role);
        if (!_role) _role = roles.find(r => r.name === role);
        return _role || false;
    },

    findMember: async (memberId, guild) => {
        let _member = await guild.members.fetch(memberId);
        if (_member) {
            return _member;
        } else {
            return false;
        }
    },

    capitalizeFirstLetter: (string) => {
        if (!string) return string;
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    capitalizeFirstLetterOfEachWord: (string) => {
        if (!string) return string;
        return string.split(' ').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
}