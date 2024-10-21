const db = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
const logger = require("./logger");

class Database {
    /**
     * @constructor
     * @param {string} name - The name of the database file (with or without .db extension).
     */
    constructor(name) {
        if (!name) throw new Error("[DB] Missing name parameter.");

        this.name = name;
        this.fileName = this.name.includes(".db") || this.name.includes(".sqlite") ? this.name : `${this.name}.db`;
        this.database = new db(path.join("data", this.fileName), { verbose: console.log });
    }

    /**
     * @static
     * @param {string} name - The name of the table.
     * @param {string} values - The columns with data types, e.g., "id INTEGER PRIMARY KEY, name TEXT".
     * @returns {string} - The SQL query to create a table.
     */
    static createTableQuery(name, values) {
        return `CREATE TABLE IF NOT EXISTS ${name} (${values})`;
    }

    /**
     * Retrieves the active database connection.
     * @returns {object} - The active SQLite database connection.
     */
    getDatabase() {
        return this.database;
    }

    /**
     * Creates a table in the database.
     * @param {string} name - The name of the table.
     * @param {string} values - The columns and types, e.g., "id INTEGER PRIMARY KEY, name TEXT".
     * @returns {Database} - The current instance for chaining.
     */
    createTable(name, values) {
        if (!name) throw new Error("[DB] Missing name parameter.");
        if (!values) throw new Error("[DB] Missing values parameter.");

        this.database.prepare(Database.createTableQuery(name, values)).run();
        return this;
    }

    /**
     * Creates multiple tables in the database.
     * @param {Array} tables - Array of objects with 'name' and 'values' properties.
     * @returns {Database} - The current instance for chaining.
     */
    createTables(tables) {
        if (!Array.isArray(tables) || !tables.length) throw new Error("[DB] Missing or invalid tables parameter.");

        for (const table of tables) {
            if (!table.name || !table.values) throw new Error("[DB] Invalid table format.");
            this.createTable(table.name, table.values);
        }
        return this;
    }

    /**
     * Deletes a table from the database.
     * @param {string} name - The name of the table.
     * @returns {Database} - The current instance for chaining.
     */
    deleteTable(name) {
        if (!name) throw new Error("[DB] Missing name parameter.");

        this.database.prepare(`DROP TABLE IF EXISTS ${name}`).run();
        return this;
    }

    /**
     * Deletes all tables in the database.
     * @returns {Database} - The current instance for chaining.
     */
    deleteAllTables() {
        const tableNames = this.database.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()
            .map(table => table.name);

        for (const name of tableNames) this.deleteTable(name);
        return this;
    }

    /**
     * Inserts a record into a table.
     * @param {string} tableName - The name of the table.
     * @param {object} data - The data to insert as key-value pairs.
     * @returns {object} - The result of the insert operation.
     */
    insert(tableName, data) {
        if (!tableName || !data || typeof data !== 'object') throw new Error("[DB] Invalid tableName or data.");

        const columns = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map(() => '?').join(', ');
        const values = Object.values(data);

        const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
        return this.database.prepare(query).run(values);
    }

    /**
     * Selects records from a table based on a condition.
     * @param {string} tableName - The name of the table.
     * @param {string} [condition] - The SQL WHERE condition (optional).
     * @returns {Array} - Array of selected records.
     */
    select(tableName, condition = "1=1") {
        if (!tableName) throw new Error("[DB] Missing tableName parameter.");

        const query = `SELECT * FROM ${tableName} WHERE ${condition}`;
        return this.database.prepare(query).all();
    }

    /**
     * Updates records in a table.
     * @param {string} tableName - The name of the table.
     * @param {object} data - The key-value pairs to update.
     * @param {string} condition - The SQL WHERE condition.
     * @returns {object} - The result of the update operation.
     */
    update(tableName, data, condition) {
        if (!tableName || !data || !condition) throw new Error("[DB] Missing tableName, data, or condition.");

        const updates = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const values = Object.values(data);

        const query = `UPDATE ${tableName} SET ${updates} WHERE ${condition}`;
        return this.database.prepare(query).run(values);
    }

    /**
     * Deletes records from a table based on a condition.
     * @param {string} tableName - The name of the table.
     * @param {string} condition - The SQL WHERE condition.
     * @returns {object} - The result of the delete operation.
     */
    deleteEntry(tableName, condition) {
        if (!tableName || !condition) throw new Error("[DB] Missing tableName or condition.");

        const query = `DELETE FROM ${tableName} WHERE ${condition}`;
        return this.database.prepare(query).run();
    }

    /**
     * Runs multiple SQL queries as a transaction.
     * @param {Function} fn - A function containing multiple queries.
     */
    transaction(fn) {
        const transaction = this.database.transaction(fn);
        transaction();
    }

    /**
     * Closes the database connection.
     */
    close() {
        this.database.close();
    }

    static initialize() {
        const dataFolder = path.join("data");
        if (!fs.existsSync(dataFolder)) fs.mkdirSync(dataFolder)

        new Database("default.db").getDatabase();
        logger.info(`Database is ready and loaded default.db`)
        return true;
    }
}

module.exports = Database;