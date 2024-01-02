const { DataTypes } = require("sequelize");

module.exports = {
    name: "infractions",
    options: {
        infID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        guild: {
            type: DataTypes.STRING,
            allowNull: false
        },
        user: {
            type: DataTypes.STRING,
            allowNull: false
        },
        moderator: {
            type: DataTypes.STRING,
            allowNull: false
        },
        action: {
            type: DataTypes.STRING,
            allowNull: false
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: false
        },
        active: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        given: {
            type: DataTypes.STRING,
            allowNull: false
        },
        expires: {
            type: DataTypes.STRING,
            allowNull: false
        },
    },
    defaults: {
        timestamps: true,
        freezeTableName: true
    }
};
