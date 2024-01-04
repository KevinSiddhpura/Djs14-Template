const { DataTypes } = require("sequelize");

module.exports = {
    name: "suggestions",
    options: {
        index: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        guild: {
            type: DataTypes.STRING,
            allowNull: false
        },
        user: {
            type: DataTypes.STRING,
            allowNull: false
        },
        channel: {
            type: DataTypes.STRING,
            allowNull: false
        },
        message: {
            type: DataTypes.STRING,
            allowNull: false
        },
        suggestion: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        votedUsers: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false
        },
        submitTime: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    defaults: {
        timestamps: true,
        freezeTableName: true
    }
};