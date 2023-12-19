const { DataTypes } = require("sequelize");

module.exports = {
    name: "moderationBanTimed",
    options: {
        guildId: { type: DataTypes.STRING, allowNull: false },
        userId: { type: DataTypes.STRING, allowNull: false },
        bannedAt: { type: DataTypes.STRING, allowNull: false },
        unBanOn: { type: DataTypes.STRING, allowNull: false },
    },
    defaults: {
        timestamps: true,
        freezeTableName: true
    }
};