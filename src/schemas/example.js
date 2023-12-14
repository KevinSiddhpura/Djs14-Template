const { DataTypes } = require("sequelize");

module.exports = {
    name: "example",
    options: {
        ex: { type: DataTypes.STRING, allowNull: false },
        am: { type: DataTypes.INTEGER, allowNull: false },
        pl: { type: DataTypes.STRING, allowNull: false },
        e: { type: DataTypes.INTEGER, allowNull: false },
    },
    defaults: {
        timestamps: true,
        freezeTableName: true
    }
};