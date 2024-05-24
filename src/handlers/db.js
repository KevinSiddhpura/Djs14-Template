const mongoose = require("mongoose");
const path = require("path");
const { getFiles } = require("./utils");
const logger = require("./helpers/logger");

const mongoConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGO_SRV);
        logger.info("Connected to MongoDB");
    } catch (error) {
        logger.error(error);
        process.exit(1);
    }

    const schemaFiles = getFiles(path.join(__dirname, "../models"));

    for (const file of schemaFiles) {
        if (!file.endsWith(".js")) continue;

        const name = file.split(path.sep).pop().split(".")[0];
        mongoose.model(name, require(file));
        logger.debug(`Loaded model: ${name}`);
    }
}

const getModel = (name) => {
    return mongoose.model(name);
}

const resetAllModels = async () => {
    const models = mongoose.modelNames();

    return Promise.all(models.map(x => mongoose.model(x).deleteMany({})))
}

const resetModel = (name) => {
    return mongoose.model(name).deleteMany({});
}

module.exports = { mongoConnection, getModel, resetAllModels, resetModel }