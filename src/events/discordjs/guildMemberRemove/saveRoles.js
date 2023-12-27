const { Client, GuildMember } = require("discord.js");
const { getDatabase } = require("../../../modules/handlers/database");
const { getRole } = require("../../../modules/utils");
const config = require("../../../../config");

module.exports = async ( /**@type {Client} */ client, /**@type {GuildMember} */ member) => {
    if (!config.createDbConnection || !config.userJoinRoles.enabled) return;

    const guild = member.guild;
    const db = getDatabase("savedRoles");
    const userRoles = member.roles.cache.map(role => role.id);

    const [data, created] = await db.findOrCreate({
        where: {
            user: member.id
        },
        defaults: {
            user: member.id,
            roles: JSON.stringify(userRoles)
        }
    });

    if (data) {
        await data.update({
            roles: JSON.stringify(userRoles)
        });
    }
}