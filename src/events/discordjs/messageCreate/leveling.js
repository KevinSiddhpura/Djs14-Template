const { Client, Message } = require("discord.js");
const config = require("../../../../config");
const { getDatabase } = require("../../../modules/handlers/database");
const { getRandomIntBetween, getRole } = require("../../../modules/utils");

async function getUserData(user) {
    const db = getDatabase("leveling");
    const [data, created] = await db.findOrCreate({
        where: {
            user: user.id
        },
        defaults: {
            user: user.id,
            xp: 0,
            level: 0,
            messages: 0
        }
    });

    return data;
};

async function updateXP(data, xpToAdd) {
    const updated = await data.update({
        xp: data.xp + xpToAdd,
        messages: data.messages + 1,
        level: data.xp >= config.levelSystem.levelXp[data.level + 1]
            ? data.level + 1 : data.level
    });

    return updated;
}

/**
 * @param {Client} client 
 * @param {Message} message 
 */

module.exports = async (client, message) => {
    if (!message.guild || message.author.bot) return;

    if (!config.levelSystem.enabled) return;

    const data = await getUserData(message.author);

    const min = config.levelSystem.minXpPerMessage;
    const max = config.levelSystem.maxXpPerMessage;

    let xptoAdd = getRandomIntBetween(min, max);

    if (config.levelSystem.roleXpMultiplier.enabled) {
        const multipliers = config.levelSystem.roleXpMultiplier.roles;
        const memberRoles = message.member.roles.cache;

        for (const role of multipliers) {
            if (memberRoles.some(r => r.id === role.role || r.name === role.role)) {
                xptoAdd *= Number(role.multiplier);
                break;
            }
        }
    };

    await updateXP(data, xptoAdd);
}