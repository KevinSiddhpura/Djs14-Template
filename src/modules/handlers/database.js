const { Sequelize } = require("sequelize");
const path = require("path");
const logger = require("../logger");
const config = require("../../../config");
const { getFiles } = require("../utils");

if(!config.createDbConnection) return;

const database = new Sequelize({
    dialect: "mysql",
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    logging: false,
});

const files = [];
const folder = getFiles(path.join(__dirname, "..", "..", "schemas"));

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