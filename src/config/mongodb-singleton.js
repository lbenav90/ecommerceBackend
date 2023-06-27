import mongoose from 'mongoose';
import config from './config.js';
import logger from './logger.js';

export default class MongoSingleton {
    static #instance;

    constructor() {
        this.#connectMongoDB();
    }

    static getInstance() {
        if (this.#instance) {
            logger.info("Ya se ha generado una conexion con Mongo!!");
        } else {
            this.#instance = new MongoSingleton();
        }
        return this.#instance;
    }

    #connectMongoDB = async () => {
        try {
            await mongoose.connect(config.mongoUrl);
            logger.info("Conectado con exito a la DB");
        } catch (error) {
            logger.error("No se pudo conectar a la DB")
            process.exit();
        }
    }
}