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
            allowNull: false
        },
        claimedAt: {
            type: DataTypes.STRING,
            allowNull: false
        },
        isClaimed: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        isOnHold: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        active: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        transcriptURL: {
            type: DataTypes.STRING,
            allowNull: false
        },
        closedBy: {
            type: DataTypes.STRING,
            allowNull: false
        },
        openReason: {
            type: DataTypes.STRING,
            allowNull: false
        },
        closeReason: {
            type: DataTypes.STRING,
            allowNull: false
        },
        openTime: {
            type: DataTypes.STRING,
            allowNull: false
        },
        closeTime: {
            type: DataTypes.STRING,
            allowNull: false
        },
    },
    defaults: {
        timestamps: true,
        freezeTableName: true
    }
};