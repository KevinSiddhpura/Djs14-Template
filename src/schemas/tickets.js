const { DataTypes } = require("sequelize");

module.exports = {
    name: "tickets",
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
        claimedBy: {
            type: DataTypes.STRING,
            allowNull: true
        },
        claimedAt: {
            type: DataTypes.STRING,
            allowNull: true
        },
        isClaimed: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        isOnHold: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        active: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        transcriptURL: {
            type: DataTypes.STRING,
            allowNull: true
        },
        closedBy: {
            type: DataTypes.STRING,
            allowNull: true
        },
        openReason: {
            type: DataTypes.STRING,
            allowNull: true
        },
        closeReason: {
            type: DataTypes.STRING,
            allowNull: true
        },
        openTime: {
            type: DataTypes.STRING,
            allowNull: false
        },
        closeTime: {
            type: DataTypes.STRING,
            allowNull: true
        },
    },
    defaults: {
        timestamps: true,
        freezeTableName: true
    }
};