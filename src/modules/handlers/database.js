const { Sequelize } = require("sequelize");
const config = require("../../../config.json");
const utils = require("../utils");
const path = require("path");
const logger = require("../logger");

if (!config.database.createConnection) return;

const database = new Sequelize({
    dialect: "mysql",
    host: config.database.host,
    port: config.database.port,
    username: config.database.username,
    password: config.database.password,
    database: config.database.database,
    logging: false,
});

const files = [];
const folder = utils.getFiles(path.join(__dirname, "..", "..", "schemas"));

for (const f of folder) {
    const data = require(f);
    files.push(data);
};

const createDatabaseConnection = async () => {
    await database.authenticate().then(() => {
        logger.mysql("Database connection connected");
        if (files.length) {
            for (i = 0; i < files.length; i++) {
                const model = database.define(files[i].name, files[i].options, files[i].defaults);
                model.sync({ alter: true });
                if (config.extraStartUpLogs) logger.mysql(`Schema file ${files[i].name} synced`);
            }
        } else {
            if (config.extraStartUpLogs) logger.mysql("No schema files found");
        }
    }).catch(e => {
        logger.error(e);
    });
};

const getDatabase = (tableName) => {
    const exists = database.isDefined(tableName);
    if (exists) {
        const model = database.model(tableName);
        return model;
    } else {
        return false;
    }
}

module.exports = { createDatabaseConnection, getDatabase }