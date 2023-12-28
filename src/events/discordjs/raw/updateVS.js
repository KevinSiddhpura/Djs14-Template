const { Client } = require("discord.js");
const { manager } = require("../../..");
const config = require("../../../../config");

module.exports = ( /**@type {Client} */ client, d) => {
    if(config.musicSupport.enabled) {
        manager.updateVoiceState(d);
    }
}