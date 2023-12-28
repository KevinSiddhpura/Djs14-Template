const { EmbedBuilder } = require("@discordjs/builders");
const { client, manager } = require("../..")
const { Colors } = require("discord.js");

module.exports = (player, track) => {
    const options = player.options;

    const guild = client.guilds.cache.get(options.guild);
    if(!guild) return;

    const channel = guild.channels.cache.get(options.textChannel);
    if(!channel) return;

    let title = track.title;
    if(title.includes("*")) title = title.replaceAll("*", "");
    if(title.includes("`")) title = title.replaceAll("`", "");
    if(title.length > 35) title = title.substring(0, 35) + "...";

    channel.send({
        embeds: [
            new EmbedBuilder()
            .setColor(Colors.Blurple)
            .setAuthor({
                name: "Started Playing",
            })
            .setDescription([
                `**Playing** • [**${title}**](${track.uri})`,
                `**Requester** • <@${track.requester.id}>`
            ].join("\n"))
            .setFooter({
                text: client.user.username,
                iconURL: client.user.displayAvatarURL()
            })
            .setThumbnail("https://cdn.discordapp.com/attachments/995980173755305996/1005068015861239849/logo.gif")
            .setTimestamp(Date.now())
        ]
    })
}