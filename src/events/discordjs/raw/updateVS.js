const { Client } = require("discord.js");
const musicSystem = require("../../../configs/musicSystem");
const { manager } = require("../../..");

/**
 * @param {Client} client 
 */

module.exports = ( /**@type {Client} */ client, d) => {
    if (musicSystem.enabled) {
        manager.updateVoiceState(d);
    }
}