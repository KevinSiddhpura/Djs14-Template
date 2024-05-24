const { Schema } = require("mongoose");

module.exports = new Schema({
    guildID: {
        type: String
    },
    userID: {
        type: String
    },
    channelID: {
        type: String
    },
    messageID: {
        type: String
    },
}, {
    timestamps: true,
});