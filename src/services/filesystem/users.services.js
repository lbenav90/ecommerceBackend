import fs from 'fs';
import __dirname from '../../utils.js';
import EErrors from '../errors/errors.js';
import generateErrorMessage from '../errors/error-messages.js';
import CustomError from '../errors/custom-error.js';

export default class UserServiceFile {
    static #instance;
    #dirPath;
    #filePath;
    #fileSystem;

    constructor() {
        this.#users = new Array();
        this.#dirPath = __dirname + '/files/users';
        this.#filePath = this.#dirPath + '/users.json';
        this.#fileSystem = fs;
    }

    static getInstance() {
        if (!this.#instance) {
            this.#instance = new UserServiceFile()
        }
        return this.#instance
    }

    async #setDirectory() {
        await this.#fileSystem.promises.mkdir(this.#dirPath, {recursive: true});
        if (!this.#fileSystem.existsSync(this.#filePath)) {
            await this.#fileSystem.promises.writeFile(this.#filePath, JSON.stringify([]))
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
            await this.#setDirectory();

            const data = await this.#fileSystem.promises.readFile(this.#filePath, 'utf-8');
            this.#users = JSON.parse(data)

            const selected = this.#users.filter(user => user.email === email)
            return selected.length === 0? null: selected[0]
        } catch (error) {
            CustomError.createError({
                name: "FileSystem Error",
                cause: generateErrorMessage(EErrors.FILESYSTEM_ERROR, { filepath: this.#filePath }),
                message: "Error fetching user from files",
                code: EErrors.FILESYSTEM_ERROR
            })
        }
    }
    getById = async (id) => {
        if (!id) {
            CustomError.createError({
                name: "Incomplete parameters",
                cause: generateErrorMessage(EErrors.INCOMPLETE_PARAMETERS, { need: 'id', got: id}),
                message: "Missing parameters fetching user by id",
                code: EErrors.INCOMPLETE_PARAMETERS
            })
        }

        try {
            await this.#setDirectory();

            const data = await this.#fileSystem.promises.readFile(this.#filePath, 'utf-8');
            this.#users = JSON.parse(data)

            const selected = this.#users.filter(user => user.id === id)
            return selected.length === 0? null: selected[0]
        } catch (error) {
            CustomError.createError({
                name: "FileSystem Error",
                cause: generateErrorMessage(EErrors.FILESYSTEM_ERROR, { filepath: this.#filePath }),
                message: "Error fetching user from files",
                code: EErrors.FILESYSTEM_ERROR
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
            await this.#setDirectory();

            const data = await this.#fileSystem.promises.readFile(this.#filePath, 'utf-8');
            this.#users = JSON.parse(data)

            const selected = this.#users.filter(u => u.email === user.email)

            if (selected.length === 0) {
                this.#users.push({id: Math.max(...this.#users.map(user => user.id)) + 1 , ...user})

                await this.#fileSystem.promises.writeFile(this.#filePath, JSON.stringify(this.#users))
                return { status: 'success', data: this.#users.map(u => u.email) }
            } else {
                return { status: 'error', msg: 'Email ya se encuentra asignado a un usuario' }
            }
        } catch (error) {
            CustomError.createError({
                name: "FileSystem Error",
                cause: generateErrorMessage(EErrors.FILESYSTEM_ERROR, { filepath: this.#filePath }),
                message: "Error creating user in files",
                code: EErrors.FILESYSTEM_ERROR
            })
        }
    }
}