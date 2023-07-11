import { log } from 'console';
import CustomError from '../errors/custom-error.js';
import generateErrorMessage from '../errors/error-messages.js';
import EErrors from '../errors/errors.js';
import tokenModel from './models/tokens.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export default class TokenServiceDB {
    static #instance;

    static getInstance() {
        if (!this.#instance) {
            this.#instance = new TokenServiceDB()
        }
        return this.#instance
    }

    create = async (email) => {
        try {
            // Check if a token exists for this user. If yes, it deletes it
            let token = await tokenModel.findOne({ email: email })
            if (token) await tokenModel.deleteOne({ email: email })

            let resetToken = crypto.randomBytes(32).toString('hex')
            let hash = await bcrypt.hash(resetToken, bcrypt.genSaltSync(10))

            const created = await tokenModel.create({ email: email, token: hash, createdAt: Date.now() })
            return { status: 'success', data: { ...created, token: resetToken } }
        } catch (error) {
            CustomError.createError({
                name: "MongoDB Error",
                cause: generateErrorMessage(EErrors.MONGODB_ERROR, { error: error }),
                message: "Error adding token in MongoDB",
                code: EErrors.MONGODB_ERROR
            })
        }
    }

    find = async (email) => {
        try {
            return await tokenModel.findOne({ email: email })
        } catch (error) {
            CustomError.createError({
                name: "MongoDB Error",
                cause: generateErrorMessage(EErrors.MONGODB_ERROR, { error: error }),
                message: "Error adding token in MongoDB",
                code: EErrors.MONGODB_ERROR
            })
        }
    }
}