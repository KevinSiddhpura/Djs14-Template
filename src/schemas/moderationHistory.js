const { DataTypes } = require("sequelize");

module.exports = {
    name: "moderationHistory",
    options: {
        guildId: { type: DataTypes.STRING, allowNull: false },
        userId: { type: DataTypes.STRING, allowNull: false },
        bans: { type: DataTypes.INTEGER, allowNull: false },
        tempBans: { type: DataTypes.INTEGER, allowNull: false },
        mutes: { type: DataTypes.INTEGER, allowNull: false },
        tempMutes: { type: DataTypes.INTEGER, allowNull: false },
        warnings: { type: DataTypes.INTEGER, allowNull: false },
        history: { type: DataTypes.TEXT, allowNull: false },
    },
    defaults: {
        timestamps: true,
        freezeTableName: true
    }
};