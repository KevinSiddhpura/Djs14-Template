const { client } = require("../../index.js");
const { wait, getRole } = require("../utils.js");
const { getDatabase } = require("./database.js");
const { EmbedBuilder, Colors } = require("discord.js");
const logger = require("../logger.js");
const config = require("../../../config.js");
const { Op } = require("sequelize");

module.exports = async () => {
    const data = getDatabase("infractions");
    const guild = client.guilds.cache.get(config.serverID);
    if (!guild) {
        return logger.warn("Configured server not found");
    }

    const temp_mutes = await data.findAll({
        where: {
            [Op.and]: [
                {
                    active: true,
                    action: "temp-mute",
                }
            ]
        }
    });

    const temp_bans = await data.findAll({
        where: {
            active: true,
            action: "temp-ban",
        }
    });

    const mute_role = await getRole(config.mutedRole, guild);
    if (!mute_role) {
        return logger.warn("Muted role not found");
    }

    if (temp_bans.length > 0) {
        for (let i = 0; i < temp_bans.length; i++) {
            const bans = await guild.bans.fetch();
            if (Date.now() >= temp_bans[i].expires) {
                if (bans.has(temp_bans[i].user)) {
                    await guild.bans.remove(temp_bans[i].user);
                }

                await data.update({
                    active: false
                }, {
                    where: {
                        infID: temp_bans[i].infID
                    }
                });
            }
        }
    }

    if (temp_mutes.length > 0) {
        for (let i = 0; i < temp_mutes.length; i++) {
            if (Date.now() >= temp_mutes[i].expires) {
                const member = await guild.members.fetch(temp_mutes[i].user);
                if (!member) continue;

                try {
                    const roleRemoved = await member.roles.remove(mute_role.id);

                    if (roleRemoved) {
                        await data.update({
                            active: false
                        }, {
                            where: {
                                infID: temp_mutes[i].infID
                            }
                        });

                        await member.send({
                            embeds: [
                                new EmbedBuilder()
                                    .setAuthor({ name: "Moderation" })
                                    .setColor(Colors.Red)
                                    .setDescription(`- Your **temp-mute** has **expired**. \n- Make sure to follow the **rules** and be **respectful**.`)
                                    .setTimestamp(Date.now())
                                    .setFooter({ text: `Infraction ID • ${temp_mutes[i].infID}` })
                            ],
                        }).catch(() => { });
                    };

                    await wait("1s");
                } catch (e) {

                }
            }
        }
    }
    return true;
}