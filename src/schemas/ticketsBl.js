const { DataTypes } = require("sequelize");

module.exports = {
    name: "ticketsBl",
    options: {
        guild: {
            type: DataTypes.STRING,
            allowNull: false
        },
        user: {
            type: DataTypes.STRING,
            allowNull: false
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: false
        },
        moderator: {
            type: DataTypes.STRING,
            allowNull: false
        },
        actionTime: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    },
    defaults: {
        timestamps: true,
        freezeTableName: true
    }
};