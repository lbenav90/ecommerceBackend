import fs from 'fs';
import __dirname from '../../utils.js';
import TicketDTO from '../dto/tickets.dto.js';

export default class TicketServiceFile {
    static #instance;
    #dirPath;
    #filePath;
    #fileSystem;

    constructor() {
        this.#tickets = new Array();
        this.#dirPath = __dirname + '/files/tickets';
        this.#filePath = this.#dirPath + '/tickets.json';
        this.#fileSystem = fs;
    }

    static getInstance() {
        if (!this.#instance) {
            this.#instance = new TicketServiceFile()
        }
        return this.#instance
    }

    async #setDirectory() {
        await this.#fileSystem.promises.mkdir(this.#dirPath, {recursive: true});
        if (!this.#fileSystem.existsSync(this.#filePath)) {
            await this.#fileSystem.promises.writeFile(this.#filePath, [])
        }
    }

    async create(ticket) {
        try {
            await this.#setDirectory()
            const data = await this.#fileSystem.promises.readFile(this.#filePath, 'utf-8');
            this.#tickets = JSON.parse(data);

            this.#tickets.push({ id: Math.max(...this.#tickets.map(t => t.id)) + 1 , ...ticket })
            await this.#fileSystem.promises.writeFile(this.#filePath, JSON.stringify(this.#tickets))

            return { status: 'success', data: this.#tickets }
        } catch (error) {
            console.error(`Error consultando los tickets por archivo, valide el archivo: ${this.#dirPath}, detalle del error: ${error}`);
            throw Error(`Error consultando los tickets por archivo, valide el archivo: ${this.#dirPath}, detalle del error: ${error}`);
        }
    }
}