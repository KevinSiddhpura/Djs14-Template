const { Sequelize } = require("sequelize");
const path = require("path");
const { getFiles } = require("../utils");

class Database {
    constructor({ name, username, host, password, port }) {
        this.database = new Sequelize({
            dialect: "mysql",
            database: name,
            username: username,
            host: host,
            password: password,
            port: port,
            logging: false,
        });

        this.files = [];
        this.folder = getFiles(path.join(__dirname, "..", "..", "schemas"));
    }

    async createConnection() {
        try {
            await this.database.authenticate();
            console.log("[Db] • Connection created");
            this.syncModels();
        } catch (error) {
            console.log("[Db] • Unable to connect to the database:", error);
            process.exit(1);
        }
    }

    syncModels() {
        for (const file of this.folder) {
            const data = require(file);
            this.files.push(data);
        }

        if (this.files.length) {
            for (const file of this.files) {
                const model = this.database.define(file.name, file.options, file.defaults);
                model.sync({ alter: true });
            }
        } else {
            console.log("[Db] • No models found");
        }
    }

    getTable(tableName) {
        const exists = this.database.isDefined(tableName);
        if (exists) {
            const model = this.database.model(tableName);
            return model;
        } else {
            return false;
        }
    }
}

module.exports = Database;
