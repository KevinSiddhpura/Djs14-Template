const { DataTypes } = require("sequelize");

module.exports = {
    name: "savedRoles",
    options: {
        user: { type: DataTypes.STRING, allowNull: false },
        roles: { type: DataTypes.TEXT, allowNull: false },
    },
    defaults: {
        timestamps: true,
        freezeTableName: true
    }
};