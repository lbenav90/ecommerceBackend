import CustomError from '../errors/custom-error.js';
import generateErrorMessage from '../errors/error-messages.js';
import EErrors from '../errors/errors.js';
import ticketModel from './models/tickets.js';

export default class TicketServiceDB {
    static #instance;

    static getInstance() {
        if (!this.#instance) {
            this.#instance = new TicketServiceDB()
        }
        return this.#instance
    }

    getById = async (code) => {
        try {
            const one = await ticketModel.find({ code: code })
            return {status: 'success', data: one}
        } catch (error) {
            CustomError.createError({
                name: "MongoDB Error",
                cause: generateErrorMessage(EErrors.MONGODB_ERROR),
                message: "Error adding ticket in MongoDB",
                code: EErrors.MONGODB_ERROR
            })
        }
    }
    create = async (ticket) => {
        if (!ticket || typeof(ticket) !== 'object') {
            CustomError.createError({
                name: "Incomplete parameters",
                cause: generateErrorMessage(EErrors.INCOMPLETE_PARAMETERS, { need: 'ticket', got: ticket}),
                message: "Missing ticket information when trying to add new ticket",
                code: EErrors.INCOMPLETE_PARAMETERS
            })
        }

        try {
            const create = await ticketModel.create(ticket)
            return {status: 'success', data: create}
        } catch (error) {
            CustomError.createError({
                name: "MongoDB Error",
                cause: generateErrorMessage(EErrors.MONGODB_ERROR),
                message: "Error adding ticket in MongoDB",
                code: EErrors.MONGODB_ERROR
            })
        }
    }
}