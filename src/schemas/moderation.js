const { DataTypes } = require("sequelize");

module.exports = {
    name: "moderation",
    options: {
        guildId: { type: DataTypes.STRING, allowNull: false },
        userId: { type: DataTypes.STRING, allowNull: false },
        overAll: { type: DataTypes.STRING, allowNull: false },
    },
    defaults: {
        timestamps: true,
        freezeTableName: true
    }
};