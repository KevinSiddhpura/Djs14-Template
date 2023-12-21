const { DataTypes } = require("sequelize");

module.exports = {
    name: "infractions", 
    options: {
        userId: { type: DataTypes.STRING, allowNull: false },
        history: { type: DataTypes.TEXT, allowNull: false },
        currentMute: { type: DataTypes.TEXT, allowNull: false },
        currentBan: { type: DataTypes.TEXT, allowNull: false },
    },
    defaults: {
        timestamps: true,
        freezeTableName: true
    }
};