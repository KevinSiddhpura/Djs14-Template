const { DataTypes } = require("sequelize");

module.exports = {
    name: "openai",
    options: {
        clientId: { type: DataTypes.STRING, allowNull: false },
        userId: { type: DataTypes.STRING, allowNull: false },
        prompts: { type: DataTypes.TEXT, allowNull: false },
        responses: { type: DataTypes.TEXT, allowNull: false },
        userRole: { type: DataTypes.STRING, allowNull: false },
        clientRole: { type: DataTypes.STRING, allowNull: false },
    },
    defaults: {
        timestamps: true,
        freezeTableName: true
    }
};