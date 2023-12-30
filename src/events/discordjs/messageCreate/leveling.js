const { Client, Message } = require("discord.js");
const config = require("../../../../config");
const { getDatabase } = require("../../../modules/handlers/database");
const { getRandomIntBetween, updateXP } = require("../../../modules/utils");

/**
 * @param {Client} client 
 * @param {Message} message 
 */

module.exports = async (client, message) => {
    if (!message.guild || message.author.bot || !config.levelSystem.enabled) return;

    const db = getDatabase("leveling");
    const min = config.levelSystem.minXpPerMessage;
    const max = config.levelSystem.maxXpPerMessage;

    let xpToAdd = getRandomIntBetween(min, max);

    if (config.levelSystem.roleXpMultiplier.enabled) {
        const memberRoles = message.member.roles.cache;
        const multiplier = memberRoles
            .map(role => config.levelSystem.roleXpMultiplier.roles.find(r => r.role === role.id || r.role === role.name)?.multiplier)
            .filter(Boolean)
            .reduce((acc, mul) => acc * Number(mul), 1);

        xpToAdd *= multiplier;
    };

    await updateXP(db, message.author, "add", xpToAdd, message.guild);
};
