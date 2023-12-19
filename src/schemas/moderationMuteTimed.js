const { DataTypes } = require("sequelize");

module.exports = {
    name: "moderationMuteTimed",
    options: {
        guildId: { type: DataTypes.STRING, allowNull: false },
        userId: { type: DataTypes.STRING, allowNull: false },
        mutedAt: { type: DataTypes.STRING, allowNull: false },
        unMuteOn: { type: DataTypes.STRING, allowNull: false },
    },
    defaults: {
        timestamps: true,
        freezeTableName: true
    }
};