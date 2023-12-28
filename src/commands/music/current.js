const { ApplicationCommandOptionType, Client, CommandInteraction, EmbedBuilder, Colors } = require("discord.js");
const { manager } = require("../..");
const config = require("../../../config");
const ms = require("ms");

module.exports = {
    name: "current",
    category: "Music",
    description: "View info about current music",
    devOnly: false,
    disabled: false,
    channelOnly: ["music-commands"],
    roleRequired: [],
    options: [],
    execute: async (/**@type {Client} */ client, /**@type {CommandInteraction} */ interaction) => {
        if(!config.musicSupport.enabled) return interaction.reply({
            content: "Music support is disabled!",
            ephemeral: true,
        });

        const player = manager.get(interaction.guild.id);
        if(!player) {
            return interaction.reply({
                content: "No active player found",
                ephemeral: true,
            });
        }

        const track = player.queue.current;
        if(!track) {
            return interaction.reply({
                content: "No active track found",
                ephemeral: true,
            });
        }

        await interaction.deferReply({ ephemeral: false });

        let title = track.title;
        if(title.includes("*")) title = title.replaceAll("*", "");
        if(title.includes("`")) title = title.replaceAll("`", "");
        if(track.title.length > 40) title = track.title.substring(0, 40) + "...";

        return interaction.editReply({
            embeds: [
                new EmbedBuilder()
                .setColor(Colors.Blurple)
                .setAuthor({
                    name: "Info about current track",
                    iconURL: client.user.displayAvatarURL({ dynamic: true }),
                })
                .setFields([{
                    name: "Track Title",
                    value: `> [**\`${title}\`**](${track.uri})`,
                    inline: false,
                }, {
                    name: "Track Duration",
                    value: `> ${ms(track.duration, { long: true })}`,
                    inline: true,
                }, {
                    name: "Track Author",
                    value: `> **${track.author}**`,
                    inline: true,
                }, {
                    name: "Track Requester",
                    value: `> <@${track.requester.id}>`,
                    inline: true,
                }, {
                    name: "Current Settings",
                    value: [
                        "```",
                        `🔊 Volume     • ${player.volume}%`,
                        `🎵 Loop Track • ${player.trackRepeat ? "Enabled" : "Disabled"}`,
                        `🎶 Loop Queue • ${player.queueRepeat ? "Enabled" : "Disabled"}`,
                        "```"
                    ].join("\n")
                }])
                .setImage(track.displayThumbnail("mqdefault"))
                .setFooter({
                    text: interaction.user.username,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setTimestamp(Date.now())
            ]
        })
    }
}