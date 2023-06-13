import ticketModel from './models/tickets.js';

export default class TicketServiceDB {
    static #instance;

    static getInstance() {
        if (!this.#instance) {
            this.#instance = new TicketServiceDB()
        }
        return this.#instance
    }

    create = async (ticket) => {
        try {
            const create = await ticketModel.create(ticket)
            return {status: 'success', data: create}
        } catch (error) {
            return {status: 'error', msg : error}
        }
    }
}