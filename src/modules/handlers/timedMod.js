const { Op } = require("sequelize");
const { config, client } = require("../../index.js");
const { wait, getRole } = require("../utils.js");
const { getDatabase } = require("./database.js");
const { EmbedBuilder, Colors } = require("discord.js");

module.exports = async () => {
    const timedMuteDB = getDatabase("moderationMuteTimed");
    const timedBanDB = getDatabase("moderationBanTimed");

    const guild = client.guilds.cache.get(config.serverID);
    const mutedRole = getRole(config.mutedRole, guild);

    const muteData = await timedMuteDB.findAll({
        where: {
            guildId: guild.id
        }
    });

    const banData = await timedBanDB.findAll({
        where: {
            guildId: guild.id
        }
    });

    if (muteData.length > 0) {
        const mapped = muteData.map(x => {
            return {
                userId: x.userId,
                guildId: x.guildId,
                mutedAt: x.mutedAt,
                unMuteOn: x.unMuteOn
            }
        });

        const filtered = mapped.filter(x => {
            if (Date.now() >= x.unMuteOn) {
                return x;
            }
        });

        if (filtered.length > 0) {
            for (let i = 0; i < filtered.length; i++) {
                const member = guild.members.cache.get(filtered[i].userId);
                if (member) {
                    try {
                        await member.roles.remove(mutedRole.id);
                        await member.send({
                            embeds: [
                                new EmbedBuilder()
                                    .setAuthor({
                                        name: `Moderation`,
                                        iconURL: client.user.displayAvatarURL()
                                    })
                                    .setDescription(`> Your temp-mute has been lifted. \n- Be a good boi now :)`)
                                    .setColor(Colors.Green)
                                    .setFooter({
                                        text: guild.name,
                                        iconURL: guild.iconURL()
                                    })
                                    .setTimestamp(Date.now())
                            ]
                        });
                    } catch (e) {

                    }

                    await timedMuteDB.destroy({
                        where: { userId: member.id, guildId: guild.id }
                    });
                    wait("1s");
                }
            }
        }
    }

    if (banData.length > 0) {
        const mapped = banData.map(x => {
            return {
                userId: x.userId,
                guildId: x.guildId,
                bannedAt: x.bannedAt,
                unBanOn: x.unBanOn
            }
        });

        const filtered = mapped.filter(x => {
            if (Date.now() >= x.unBanOn) {
                return x;
            }
        });

        if (filtered.length > 0) {
            const bannedUsers = await guild.bans.fetch();
            for (let i = 0; i < filtered.length; i++) {
                const user = bannedUsers.get(filtered[i].userId);
                if (user) {
                    await guild.bans.remove(user).catch(() => { });
                };
                await timedBanDB.destroy({
                    where: { userId: member.id, guildId: guild.id }
                });
                wait("1s");
            }
        }
    }

    return true;
}