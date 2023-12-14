const { DataTypes } = require("sequelize");

module.exports = {
    name: "tableName", // The name of the table
    options: { // The options for the table
        option1: { type: DataTypes.STRING, allowNull: false },
        option2: { type: DataTypes.INTEGER, allowNull: false },
    },
    defaults: { // The defaults for the table
        timestamps: true,
        freezeTableName: true
    }
};