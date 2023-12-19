const { ApplicationCommandOptionType, Client, CommandInteraction, EmbedBuilder, Colors } = require("discord.js");
const { getDatabase } = require("../../modules/handlers/database");
const ms = require("ms");
const { config } = require("../..");
const { Op } = require("sequelize");

module.exports = {
    name: "ban",
    category: "Moderation",
    description: "ban a user",
    devOnly: false,
    disabled: false,
    roleRequired: ["Admin"],
    options: [
        {
            type: ApplicationCommandOptionType.User,
            name: "user",
            description: "User to be banned",
            required: true,
        },
        {
            type: ApplicationCommandOptionType.String,
            name: "message",
            description: "Reason for ban",
            required: true,
        },
        {
            type: ApplicationCommandOptionType.String,
            name: "time",
            description: "For how long",
            choices: [
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
        await interaction.deferReply({ ephemeral: true });

        const user = interaction.options.getUser("user");
        const message = interaction.options.getString("message");
        const time = interaction.options.getString("time") || "n/a";

        const db1 = getDatabase("moderation");
        const db2 = getDatabase("moderationHistory");
        const db3 = getDatabase("moderationBanTimed");

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
                mutes: 0,
                bans: 0,
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
            timedMsg = `Banned till <t:${x}:f>`;
        } else {
            timedMsg = "Permanent Ban";
        }

        const checkIfTimedBanned = await db3.findOne({
            where: {
                [Op.and]: [
                    {
                        guildId: interaction.guildId,
                        userId: user.id,
                    }
                ]
            },
        });

        if (checkIfTimedBanned) {
            return interaction.editReply({
                content: "This user is already temp-banned",
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

                // await member.ban({ reason: message });
            } catch (e) {
                console.log(e);
            }

            await data_overAll[0].update({
                overAll: data_overAll[0].overAll + 1
            })

            const _history = {
                guild: interaction.guild.id,
                action: time === "n/a" ? "ban" : "temp-ban",
                moderator: interaction.user.id,
                member: user.id,
                timed: false,
                message,
                timeStamp: interaction.createdTimestamp,
            };

            await data_history[0].update({
                tempBans: time === "n/a" ? data_history[0].tempBans + 1 : data_history[0].tempMutes,
                bans: time === "n/a" ? data_history[0].bans + 1 : data_history[0].mutes,
                history: JSON.stringify([_history, ...JSON.parse(data_history[0].history)])
            });

            if (time !== "n/a") {
                const t = interaction.createdTimestamp;
                const m = ms(time);
                await db3.create({
                    guildId: interaction.guildId,
                    userId: user.id,
                    bannedAt: t,
                    unBanOn: t + m
                });
            }

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Gold)
                        .setDescription(`**Action** on <@${user.id}>, has been ${time === "n/a" ? "banned" : "temp-banned"} **successfully**!`)
                ]
            });
        }
    }
}