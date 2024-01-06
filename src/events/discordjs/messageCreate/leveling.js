const { Client, Message } = require("discord.js");
const { getDatabase } = require("../../../modules/handlers/database");
const { getRandomIntBetween, updateXP } = require("../../../modules/utils");
const levelingSystem = require("../../../configs/levelingSystem");

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

    if (levelingSystem.roleXpMultiplier.enabled) {
        const memberRoles = message.member.roles.cache;
        const multiplier = memberRoles
            .map(role => levelingSystem.roleXpMultiplier.roles.find(r => r.role === role.id || r.role === role.name)?.multiplier)
            .filter(Boolean)
            .reduce((acc, mul) => acc * Number(mul), 1);

        xpToAdd *= multiplier;
    };

    await updateXP(db, message.author, "add", xpToAdd, message.guild);
};
