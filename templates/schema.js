const mongoose = require("mongoose");

const testSchema = new mongoose.Schema({
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

const testModal = mongoose.model("test", testSchema);
module.exports = testModal;