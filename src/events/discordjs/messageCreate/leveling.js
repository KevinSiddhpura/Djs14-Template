const { Client, Message } = require("discord.js");
const config = require("../../../../config");
const { getDatabase } = require("../../../modules/handlers/database");
const { getRandomIntBetween } = require("../../../modules/utils");
const logger = require("../../../modules/logger");

async function getUserData(user) {
    const db = getDatabase("leveling");
    const [data] = await db.findOrCreate({
        where: { user: user.id },
        defaults: { user: user.id, xp: 0, level: 0, messages: 0 }
    });

    return data;
};

async function updateXP(data, xpToAdd, message) {
    let newXp = data.xp + xpToAdd;
    let newLevel = data.level;

    while (config.levelSystem.levelXp[newLevel + 1] && newXp >= config.levelSystem.levelXp[newLevel + 1]) {
        newLevel++;
    }

    const updated = await data.update({ xp: newXp, level: newLevel, messages: data.messages + 1 });

    if (config.levelSystem.roleRewards.enabled) {
        const memberRoles = message.member.roles.cache;

        const rolesToBeAdded = [];

        for (let lvl = 1; lvl <= newLevel; lvl++) {
            const reward = config.levelSystem.roleRewards.reward.find(r => r.level === lvl);
            if (reward) {
                const role = message.guild.roles.cache.find(r => r.name === reward.role || r.id === reward.role);

                if(!role) {
                    logger.error(`Role ${reward.role} not found!`);
                    continue;
                }

                if (role && !memberRoles.has(role.id)) {
                    rolesToBeAdded.push(role.id);
                };
            }
        };

        if (rolesToBeAdded.length > 0) {
            await message.member.roles.add([...rolesToBeAdded], "Level up reward");
        }
    };

    return updated;
}


/**
 * @param {Client} client 
 * @param {Message} message 
 */

module.exports = async (client, message) => {
    if (!message.guild || message.author.bot || !config.levelSystem.enabled) return;

    const data = await getUserData(message.author);
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

    await updateXP(data, xpToAdd, message);
};
