const { ApplicationCommandOptionType, Client, CommandInteraction, EmbedBuilder, Colors } = require("discord.js");
const { getDatabase } = require("../../modules/handlers/database");
const ms = require("ms");
const { getRole } = require("../../modules/utils");
const { config } = require("../..");
const { Op } = require("sequelize");

module.exports = {
    name: "mute",
    category: "Moderation",
    description: "Mute a user",
    devOnly: false,
    disabled: false,
    roleRequired: ["Mod"],
    options: [
        {
            type: ApplicationCommandOptionType.User,
            name: "user",
            description: "User to be muted",
            required: true,
        },
        {
            type: ApplicationCommandOptionType.String,
            name: "message",
            description: "Reason for mute",
            required: true,
        },
        {
            type: ApplicationCommandOptionType.String,
            name: "time",
            description: "For how long",
            choices: [
                {
                    name: "5 Minutes",
                    value: "5m",
                },
                {
                    name: "30 Minutes",
                    value: "30m",
                },
                {
                    name: "1 Hour",
                    value: "1h",
                },
                {
                    name: "12 Hours",
                    value: "12h",
                },
                {
                    name: "1 Day",
                    value: "1d",
                },
                {
                    name: "3 Days",
                    value: "3d",
                },
                {
                    name: "1 Week",
                    value: "1w",
                },
                {
                    name: "2 Weeks",
                    value: "14d",
                },
                {
                    name: "1 Month",
                    value: "30d",
                }
            ],
            required: false,
        }
    ],
    execute: async (/**@type {Client} */ client, /**@type {CommandInteraction} */ interaction) => {
        const role = await getRole(config.mutedRole, interaction.guild);
        if (!role) {
            return interaction.reply({ content: "Muted role not found", ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        const user = interaction.options.getUser("user");
        const message = interaction.options.getString("message");
        const time = interaction.options.getString("time") || "n/a";

        const db1 = getDatabase("moderation");
        const db2 = getDatabase("moderationHistory");
        const db3 = getDatabase("moderationMuteTimed");

        const data_overAll = await db1.findOrCreate({
            where: {
                guildId: interaction.guildId,
                userId: user.id,
            },
            defaults: {
                guildId: interaction.guildId,
                userId: user.id,
                overAll: 0,
            }
        });

        const data_history = await db2.findOrCreate({
            where: {
                guildId: interaction.guildId,
                userId: user.id
            },
            defaults: {
                guildId: interaction.guildId,
                userId: user.id,
                tempBans: 0,
                bans: 0,
                mutes: 0,
                tempMutes: 0,
                warnings: 0,
                history: JSON.stringify([]),
            }
        });

        let timedMsg = "";
        if (time !== "n/a") {
            const t = interaction.createdTimestamp;
            const m = ms(time);
            const x = `${((t + m) / 1000).toFixed(0)}`
            timedMsg = `Muted till <t:${x}:f>`;
        } else {
            timedMsg = "Permanent Mute";
        }

        const checkIfTimedMuted = await db3.findOne({
            where: {
                [Op.and]: [
                    {
                        guildId: interaction.guildId,
                        userId: user.id,
                    }
                ]
            },
        });

        if (checkIfTimedMuted) {
            return interaction.editReply({
                content: "This user is already temp-muted",
            })
        };

        const member = await interaction.guild.members.fetch(user.id);
        if (member) {
            try {
                await member.send({
                    embeds: [
                        new EmbedBuilder()
                            .setAuthor({
                                name: "Moderation",
                                iconURL: client.user.displayAvatarURL()
                            })
                            .setColor(Colors.Red)
                            .setDescription([
                                "- **Action:** " + timedMsg,
                                `- **Moderator:** <@${interaction.user.id}>`,
                                `- **Reason**: ${message}`,
                            ].join("\n"))
                            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
                            .setThumbnail("https://media1.tenor.com/m/NF84so0XFSEAAAAC/hololive-hologra.gif")
                            .setTimestamp(Date.now())
                    ]
                });

                await member.roles.add(role.id);
            } catch (e) {
                console.log(e);
            }

            await data_overAll[0].update({
                overAll: data_overAll[0].overAll + 1
            })

            const _history = {
                guild: interaction.guild.id,
                action: time === "n/a" ? "mute" : "temp-mute",
                moderator: interaction.user.id,
                member: user.id,
                timed: time === "n/a" ? false : time,
                message,
                timeStamp: interaction.createdTimestamp,
            };

            await data_history[0].update({
                tempMutes: time === "n/a" ? data_history[0].tempMutes + 1 : data_history[0].tempMutes,
                mutes: time === "n/a" ? data_history[0].mutes + 1 : data_history[0].mutes,
                history: JSON.stringify([_history, ...JSON.parse(data_history[0].history)])
            });

            if (time !== "n/a") {
                const t = interaction.createdTimestamp;
                const m = ms(time);
                await db3.create({
                    guildId: interaction.guildId,
                    userId: user.id,
                    mutedAt: t,
                    unMuteOn: m + t,
                })
            }

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Gold)
                        .setDescription(`**Action** on <@${user.id}>, has been ${time === "n/a" ? "muted" : "temp-muted"} **successfully**!`)
                ]
            });
        }
    }
}