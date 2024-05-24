// Must create this under models folder
// Name of the file is the name of the model

const { Schema } = require("mongoose");

module.exports = new Schema({
    guildID: {
        type: String
    },
}, {
    timestamps: true,
});