const { Client, ApplicationCommandType, MessageContextMenuCommandInteraction } = require("discord.js");

module.exports = {
    enabled: true,
    type: ApplicationCommandType.Message,
    name: "",
    description: "",
    devOnly: false,
    adminOnly: false,
    allowedChannels: [],
    allowedRoles: [],

    /**
     * 
     * @param {Client} client 
     * @param {MessageContextMenuCommandInteraction} interaction 
     */

    runContext: async (client, interaction) => {

    }
}