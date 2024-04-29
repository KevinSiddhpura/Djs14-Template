const fs = require("fs");
const path = require("path");
const ms = require("ms");
const { default: axios } = require("axios");

module.exports = {
    wait: (time) => new Promise(resolve => setTimeout(resolve, ms(time))),

    paste: (data, site = "https://paste.kwin.in") => {
        return new Promise((resolve, reject) => {
            if (!data) {
                reject(new Error("No data provided"));
                return;
            }

            axios.post(`${site}/documents`, data)
                .then(res => {
                    const json = res.data;
                    if (!json || !json.key) {
                        reject(new Error("Invalid response from paste site"));
                    }

                    resolve(`${site}/${json.key}`);
                })
        })
    },

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

    getChannel: (channel, guild) => {
        const serverChannels = guild.channels.cache;
        return serverChannels.find(c => c.id === channel || c.name === channel);
    },

    getRole: (role, guild) => {
        const serverRoles = guild.roles.cache;
        return serverRoles.find(r => r.id === role || r.name === role);
    },

    capitalize: (string, allWords = false) => {
        if (allWords) {
            return string.split(" ").map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)

            ).join(" ");
        } else {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }
    },

    findRoles: (roles, guild) => {
        const foundRoles = [];
        const serverRoles = guild.roles.cache;

        for (const role of roles) {
            const foundRole = serverRoles.find(r => r.id === role || r.name === role);
            if (foundRole) foundRoles.push(foundRole);
        }

        return foundRoles;
    },

    hasRole: (roles, member) => {
        const foundRoles = module.exports.findRoles(roles, member.guild).map(r => [r.id, r.name]).flat(1);
        if (foundRoles.length == 0) {
            throw new Error("Roles not found in server");
        }

        let arr = roles.map(x => foundRoles.includes(x));
        return arr.includes(true);
    },

    findChannels: (channels, guild) => {
        const foundChannels = [];
        const serverChannels = guild.channels.cache;

        for (const channel of channels) {
            const foundChannel = serverChannels.find(c => c.id === channel || c.name === channel);
            if (foundChannel) foundChannels.push(foundChannel);
        }

        return foundChannels;
    },

    addSpace: (string, number, inFront = true) => {
        if (inFront) {
            return string + new Array(number).fill("\u200b ").join("");
        } else {
            return new Array(number).fill("\u200b ").join("") + string;
        }
    },

    splitArray: (array, perArray) => {
        const arrays = [];
        const maxArrays = Math.ceil(array.length / perArray);

        for (let i = 0; i < maxArrays; i++) {
            arrays.push(array.slice((i * perArray), (i * perArray) + perArray))
        }

        return arrays
    }
}