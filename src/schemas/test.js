const { DataTypes } = require("sequelize");

module.exports = {
    name: "test",
    options: {
        guild: {
            type: DataTypes.STRING,
            allowNull: false
        },
        someData: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
};