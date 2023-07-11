import CustomError from '../errors/custom-error.js';
import generateErrorMessage from '../errors/error-messages.js';
import EErrors from '../errors/errors.js';
import tokenModel from './models/tokens.js';
import userModel from './models/users.js'

export default class UserServiceDB {
    static #instance;

    static getInstance() {
        if (!this.#instance) {
            this.#instance = new UserServiceDB()
        }
        return this.#instance
    }

    getByEmail = async (email) => {
        if (!email) {
            CustomError.createError({
                name: "Incomplete parameters",
                cause: generateErrorMessage(EErrors.INCOMPLETE_PARAMETERS, { need: 'email', got: email}),
                message: "Missing parameters fetching user by email",
                code: EErrors.INCOMPLETE_PARAMETERS
            })
        }

        try {
            return await userModel.findOne({ email: email })
        } catch (error) {
            CustomError.createError({
                name: "MongoDB Error",
                cause: generateErrorMessage(EErrors.MONGODB_ERROR),
                message: "Error fetching user in MongoDB",
                code: EErrors.MONGODB_ERROR
            })
        } 
    }
    getById = async (id) => {
        if (!id) {
            CustomError.createError({
                name: "Incomplete parameters",
                cause: generateErrorMessage(EErrors.INCOMPLETE_PARAMETERS, { need: 'userId', got: id}),
                message: "Missing user id when trying to fetch user",
                code: EErrors.INCOMPLETE_PARAMETERS
            })
        }

        try {
            return await userModel.findById(id);
        } catch (error) {
            CustomError.createError({
                name: "MongoDB Error",
                cause: generateErrorMessage(EErrors.MONGODB_ERROR),
                message: "Error fetching user in MongoDB",
                code: EErrors.MONGODB_ERROR
            })
        } 
    }
    create = async (user) => {
        if (!user || typeof(user) !== 'object') {
            CustomError.createError({
                name: "Incomplete parameters",
                cause: generateErrorMessage(EErrors.INCOMPLETE_PARAMETERS, { need: 'user', got: user}),
                message: "Missing user information when trying to create user",
                code: EErrors.INCOMPLETE_PARAMETERS
            })
        }

        try {
            return await userModel.create(user);
        } catch (error) {
            CustomError.createError({
                name: "MongoDB Error",
                cause: generateErrorMessage(EErrors.MONGODB_ERROR, { error: error }),
                message: "Error creating user in MongoDB",
                code: EErrors.MONGODB_ERROR
            })
        } 
    }
    resetPassword = async (email, password) => {
        try {
            await userModel.updateOne({ email: email }, { password: password })
            await tokenModel.deleteOne({ email: email })
        } catch (error) {
            CustomError.createError({
                name: "MongoDB Error",
                cause: generateErrorMessage(EErrors.MONGODB_ERROR, { error: error }),
                message: "Error creating user in MongoDB",
                code: EErrors.MONGODB_ERROR
            })
        }
    }
    changeUserType = async (id, role) => {
        try {
            const change = await userModel.updateOne({ _id: id }, { role: role === 'user'? 'premium': 'user'})
            return { status: 'success', data: change }
        } catch (error) {
            CustomError.createError({
                name: "MongoDB Error",
                cause: generateErrorMessage(EErrors.MONGODB_ERROR, { error: error }),
                message: "Error creating user in MongoDB",
                code: EErrors.MONGODB_ERROR
            })
        }
    }
}