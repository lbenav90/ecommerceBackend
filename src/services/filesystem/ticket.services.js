import fs from 'fs';
import __dirname from '../../utils.js';
import TicketDTO from '../dto/tickets.dto.js';
import EErrors from '../errors/errors.js';
import generateErrorMessage from '../errors/error-messages.js';
import CustomError from '../errors/custom-error.js';

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
        if (!ticket || typeof(ticket) !== 'object') {
            CustomError.createError({
                name: "Incomplete parameters",
                cause: generateErrorMessage(EErrors.INCOMPLETE_PARAMETERS, { need: 'ticket', got: ticket}),
                message: "Missing ticket information when trying to add new ticket",
                code: EErrors.INCOMPLETE_PARAMETERS
            })
        }

        try {
            await this.#setDirectory()
            const data = await this.#fileSystem.promises.readFile(this.#filePath, 'utf-8');
            this.#tickets = JSON.parse(data);

            this.#tickets.push({ id: Math.max(...this.#tickets.map(t => t.id)) + 1 , ...ticket })
            await this.#fileSystem.promises.writeFile(this.#filePath, JSON.stringify(this.#tickets))

            return { status: 'success', data: this.#tickets }
        } catch (error) {
            CustomError.createError({
                name: "FileSystem Error",
                cause: generateErrorMessage(EErrors.FILESYSTEM_ERROR, { filepath: this.#filePath }),
                message: "Error creating new ticket in files",
                code: EErrors.FILESYSTEM_ERROR
            })
        }
    }
}