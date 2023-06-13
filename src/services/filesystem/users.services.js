import fs from 'fs';
import __dirname from '../../utils.js';

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
        try {
            await this.#setDirectory();

            const data = await this.#fileSystem.promises.readFile(this.#filePath, 'utf-8');
            this.#users = JSON.parse(data)

            const selected = this.#users.filter(user => user.email === email)
            return selected.length === 0? null: selected[0]
        } catch (error) {
            console.error(`Error consultando los usuarios por archivo, valide el archivo: ${this.#dirPath}, detalle del error: ${error}`);
            throw Error(`Error consultando los usuarios por archivo, valide el archivo: ${this.#dirPath}, detalle del error: ${error}`);
        }
    }
    getById = async (id) => {
        try {
            await this.#setDirectory();

            const data = await this.#fileSystem.promises.readFile(this.#filePath, 'utf-8');
            this.#users = JSON.parse(data)

            const selected = this.#users.filter(user => user.id === id)
            return selected.length === 0? null: selected[0]
        } catch (error) {
            console.error(`Error consultando los usuarios por archivo, valide el archivo: ${this.#dirPath}, detalle del error: ${error}`);
            throw Error(`Error consultando los usuarios por archivo, valide el archivo: ${this.#dirPath}, detalle del error: ${error}`);
        }
    }
    create = async (user) => {
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
            console.error(`Error consultando los usuarios por archivo, valide el archivo: ${this.#dirPath}, detalle del error: ${error}`);
            throw Error(`Error consultando los usuarios por archivo, valide el archivo: ${this.#dirPath}, detalle del error: ${error}`);
        }
    }
}