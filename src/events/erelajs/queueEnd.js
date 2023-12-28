const { client } = require("../..")

module.exports = (manager, player) => {
    const guild = client.guilds.cache.get(player.guild);
    if(!guild) return;

    const channel = guild.channels.cache.get(player.textChannel);
    if(!channel) return;

    channel.send({
        content: "> 🛑 Music party **ended**, completed playing the songs!"
    });
}