module.exports = async (manager, player, oldChannel, newChannel) => {
    if (newChannel) {
        await player.setVoiceChannel(newChannel);
        if (player.paused) player.pause(false);
    }
};
