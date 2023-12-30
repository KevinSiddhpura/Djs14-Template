const fs = require('fs');
const ms = require('ms');
const path = require('path');
const config = require('../../config');
const logger = require('./logger');

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
        const channels = guild.channels.cache;
        if (Array.isArray(channel)) {
            let _channels = [];
            for (const _c of channel) {
                let _channel = channels.find(c => c.id === _c);
                if (!_channel) _channel = channels.find(c => c.name === _c);
                if (_channel !== undefined) _channels.push(_channel);
            }
            return _channels;
        } else {
            let _channel = channels.find(c => c.id === channel);
            if (!_channel) _channel = channels.find(c => c.name === channel);
            return _channel || false;
        }
    },

    getRole: (role, guild) => {
        const roles = guild.roles.cache;
        if (Array.isArray(role)) {
            let _roles = [];
            for (const _r of role) {
                let _role = roles.find(r => r.id === _r);
                if (!_role) _role = roles.find(r => r.name === _r);
                if (_role !== undefined) _roles.push(_role);
            }
            return _roles;
        } else {
            let _role = roles.find(r => r.id === role);
            if (!_role) _role = roles.find(r => r.name === role);
            return _role || false;
        }
    },

    findMember: async (memberId, guild) => {
        let _member = await guild.members.fetch(memberId);
        if (_member) {
            return _member;
        } else {
            return false;
        }
    },

    getRandomIntBetween: (min, max) => {
        return Math.floor(Math.random() * (max - min + 1) + min);
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
    },

    updateXP: async (db, user, type, xpChange, guild, manualUpdate = false) => {
        let data = await db.findOne({ where: { user: user.id } });

        if (!data) {
            data = await db.create({ user: user.id, xp: 0, level: 0, messages: 0 });
        }

        let newXp = data.xp;

        if (type == "add") {
            newXp += xpChange;
        } else if (type == "remove") {
            newXp -= xpChange;
        };

        let newLevel = data.level;

        while (config.levelSystem.levelXp[newLevel + 1] && newXp >= config.levelSystem.levelXp[newLevel + 1]) {
            newLevel++;
        }

        while (newXp < config.levelSystem.levelXp[newLevel] && newLevel > 0) {
            newLevel--;
        }

        await data.update({ xp: newXp, level: newLevel, messages: manualUpdate ? data.messages : data.messages + 1 });

        if (config.levelSystem.roleRewards.enabled && guild) {
            const member = guild.members.cache.get(user.id);
            if (!member) return false;

            const rolesToBeAdded = [];
            const rolesToBeRemoved = [];

            config.levelSystem.roleRewards.reward.forEach(reward => {
                const role = module.exports.getRole(reward.role, guild);
                if (!role) {
                    logger.error(`Role ${reward.role} not found!`);
                    return;
                }

                if (newLevel >= reward.level && !member.roles.cache.has(role.id)) {
                    rolesToBeAdded.push(role.id);
                } else if (newLevel < reward.level && member.roles.cache.has(role.id)) {
                    rolesToBeRemoved.push(role.id);
                }
            });

            if (rolesToBeAdded.length > 0) {
                await member.roles.add([...rolesToBeAdded], "Level up reward");
            };

            if (rolesToBeRemoved.length > 0) {
                await member.roles.remove([...rolesToBeRemoved], "Level down adjustment");
            };
        }

        return data;
    }
}