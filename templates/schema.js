const { DataTypes } = require("sequelize");

module.exports = {
    name: "template",
    options: {
        some: {
            type: DataTypes.STRING,
            allowNull: false
        },
        data: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
};