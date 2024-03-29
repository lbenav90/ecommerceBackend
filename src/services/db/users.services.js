import { sendDeletedInactiveAccountEmail } from '../../utils.js';
import UserDTO from '../dto/users.dto.js';
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
    getAll = async () => {
        try {
            const users = await userModel.find();
            return users.map(user => {
                let u = new UserDTO(user);
                return u.get();
            })
        } catch (error) {
            CustomError.createError({
                name: "MongoDB Error",
                cause: generateErrorMessage(EErrors.MONGODB_ERROR),
                message: "Error fetching users in MongoDB",
                code: EErrors.MONGODB_ERROR
            })
        }
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
    delete = async (id) => {
        try {
            const del = await userModel.findByIdAndDelete(id)
            return del
        } catch (error) {
            CustomError.createError({
                name: "MongoDB Error",
                cause: generateErrorMessage(EErrors.MONGODB_ERROR, { error: error }),
                message: "Error deleting user in MongoDB",
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
                message: "Error changing user type in MongoDB",
                code: EErrors.MONGODB_ERROR
            })
        }
    }
    updateLastConnection = async (email) => {
        try {
            const change = await userModel.updateOne({ email: email }, { last_connection: new Date() })
            return { status: 'success', data: change }
        } catch (error) {
            CustomError.createError({
                name: "MongoDB Error",
                cause: generateErrorMessage(EErrors.MONGODB_ERROR, { error: error }),
                message: "Error updating last connection in MongoDB",
                code: EErrors.MONGODB_ERROR
            })
        }
    }
    updateDocuments = async (email, documents) => {
        try {
            const change = await userModel.updateOne({ email: email }, { documents: documents })
            return { status: 'success', data: change }
        } catch (error) {
            CustomError.createError({
                name: "MongoDB Error",
                cause: generateErrorMessage(EErrors.MONGODB_ERROR, { error: error }),
                message: "Error updating user documents in MongoDB",
                code: EErrors.MONGODB_ERROR
            })
        }
    }
    deleteInactive = async (users) => {
        users.forEach(async (user) => {
            if (user.role === 'admin'){
                return;
            }

            if ((new Date() - user.last_connection) / (1000*3600*24) > 2) {
                try {
                    await userModel.deleteOne({ email: user.email })
                    sendDeletedInactiveAccountEmail(user.email)
                } catch (error) {
                    CustomError.createError({
                        name: "MongoDB Error",
                        cause: generateErrorMessage(EErrors.MONGODB_ERROR, { error: error }),
                        message: "Error deleting user in MongoDB",
                        code: EErrors.MONGODB_ERROR
                    })
                }
            }
        })
    }
}