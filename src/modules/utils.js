const fs = require('fs');
const ms = require('ms');
const path = require('path');
const config = require('../../config');
const axios = require('axios');
const logger = require('./logger');
const { Op } = require('sequelize');
const { TextChannel, Guild, Role, GuildMember, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

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

    /**
     * 
     * @param {String} channel 
     * @param {Guild} guild 
     * @returns {TextChannel}
     */

    getChannel: (channel, guild) => {
        const channels = guild.channels.cache;
        return Array.isArray(channel) ?
            channel.map(c => channels.find(ch => ch.id === c || ch.name === c)).filter(c => c !== undefined) :
            channels.find(c => c.id === channel || c.name === channel) || false;
    },

    /**
     * 
     * @param {String} role 
     * @param {Guild} guild 
     * @returns {Role}
     */

    getRole: (role, guild) => {
        const roles = guild.roles.cache;
        return Array.isArray(role) ?
            role.map(r => roles.find(ro => ro.id === r || ro.name === r)).filter(ro => ro !== undefined) :
            roles.find(r => r.id === role || r.name === role) || false;
    },


    /**
     * 
     * @param {Array} roles 
     * @param {GuildMember} member
     * @returns {Boolean} 
     */

    hasRole: (roles, member) => {
        if (Array.isArray(roles)) {
            return !!member.roles.cache.some(r => roles.includes(r.name) || roles.includes(r.id))
        } else {
            return !!member.roles.cache.has(r => r.id == roles || r.name == roles)
        }
    },

    /**
     * 
     * @param {String} memberId 
     * @param {Guild} guild 
     * @returns {GuildMember}
     */

    findMember: async (memberId, guild) => {
        let _member = await guild.members.fetch(memberId);
        if (_member) {
            return _member;
        } else {
            return false;
        }
    },

    /**
     * 
     * @param {Number} min 
     * @param {Number} max 
     * @returns {Number}
     */

    getRandomIntBetween: (min, max) => {
        return Math.floor(Math.random() * (max - min + 1) + min);
    },

    /**
     * 
     * @param {String} string 
     * @returns {String}
     */

    capitalizeFirstLetter: (string) => {
        if (!string) return string;
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    /**
     * 
     * @param {String} string 
     * @returns {String}
     */

    capitalizeFirstLetterOfEachWord: (string) => {
        if (!string) return string;
        return string.split(' ').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    },

    /**
     * 
     * @param {String} text 
     * @param {Boolean} raw 
     * @param {String} paste_site 
     * @returns {Object}
     */

    paste: (text, raw = false, paste_site = config.pastebinURL || "https://paste.kwin.in") => {
        return new Promise((resolve, reject) => {
            if (!text) {
                reject("Invalid text.");
                return;
            }

            axios.post(`${paste_site}/documents`, text)
                .then(response => {
                    const json = response.data;
                    if (!json || !json.key) {
                        reject("Invalid response from paste site: " + response);
                        return;
                    }
                    resolve(`${paste_site}${raw ? "/raw" : ""}/${json.key}`);
                })
                .catch(err => {
                    reject(err);
                });
        });
    },

    updateXP: async (db, user, type, xpChange, guild, manualUpdate = false) => {
        let data = await db.findOne({
            where: {
                [Op.and]: [
                    {
                        user: user.id,
                        guild: guild.id
                    },
                ]
            }
        });

        if (!data) {
            data = await db.create({ guild: guild.id, user: user.id, xp: 0, level: 0, messages: 0 });
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
    },

    updateSuggestionMessageVoteAction: async (data, /**@type {ButtonInteraction} */ interaction) => {
        const upVotes = JSON.parse(data.votedUsers).filter((t) => t.type == "upvote");
        const downVotes = JSON.parse(data.votedUsers).filter((t) => t.type == "downvote");

        const rows = [
            new ActionRowBuilder()
                .setComponents([
                    new ButtonBuilder()
                        .setCustomId("suggestion-upvote")
                        .setEmoji("👍")
                        .setLabel("Likes • " + upVotes.length)
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId("suggestion-viewvoters")
                        .setEmoji("📃")
                        .setLabel("View Voters")
                        .setDisabled(config.suggestionSystem.showVoters ? false : true)
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId("suggestion-downvote")
                        .setEmoji("👎")
                        .setLabel("Dislikes • " + downVotes.length)
                        .setStyle(ButtonStyle.Danger),
                ]),
            new ActionRowBuilder()
                .setComponents([
                    new StringSelectMenuBuilder()
                        .setCustomId("suggestion-manage")
                        .setPlaceholder("Manage this suggestion")
                        .setOptions([{
                            label: "Accept Suggestion",
                            emoji: "✅",
                            value: "accept",
                        }, {
                            label: "Reject Suggestion",
                            emoji: "❌",
                            value: "reject",
                        }, {
                            label: "Put On Hold",
                            emoji: "⏲",
                            value: "hold",
                        }, {
                            label: "Reset Votes",
                            emoji: "🔄",
                            value: "reset",
                        }, {
                            label: "Delete Suggestion",
                            emoji: "🗑️",
                            value: "delete",
                        }])
                ])
        ];

        let status;
        if (data.status == "pending") status = "Pending Review";
        if (data.status == "accepted") status = "Accepted";
        if (data.status == "rejected") status = "Rejected";
        if (data.status == "hold") status = "On Hold";

        const embed = interaction.message.embeds[0];
        const newEmbed = new EmbedBuilder()
            .setAuthor({
                name: embed.author.name,
                iconURL: embed.author.iconURL
            })
            .setDescription(embed.description)
            .setColor(embed.color)
            .setThumbnail(embed.thumbnail.url)

        newEmbed.setFields({
            name: "Extra Info",
            value: [
                `- **Submitted by** • <@${data.user}> | \`${data.user}\``,
                `- **Status** • ${status}`,
                `- **Reactions** • \` ${upVotes.length + downVotes.length} \``,
                `- **Submitted at** • <t:${(data.submitTime / 1000).toFixed(0)}:f>`,
            ].join("\n")
        })

        return interaction.message.edit({
            embeds: [newEmbed],
            components: [...rows]
        });
    }
}