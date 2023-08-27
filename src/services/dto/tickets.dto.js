import { uManager } from "../factory.js"

export default class TicketDTO {
    constructor(ticket) {
        this.code = ticket.code
        this.amount = ticket.amount
        this.purchaser = ticket.user
        this.products = ticket.products
    }

    get = async () => {
        const user = await uManager.getByEmail(this.purchaser.email)
        return {
            code: this.code,
            amount: this.amount,
            purchaser: user._id,
            products: this.products
        }
    }
}