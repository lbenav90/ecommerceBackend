import mongoose from "mongoose";

const collectionName = 'tickets';

const ticketSchema = new mongoose.Schema({
    code: { type: String, required: true},
    purchase_datetime: { type: Date, required: true, default: new Date() },
    amount: { type: Number, required: true },
    purchaser: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    products: { 
        type: [{
                    product: {
                                type: mongoose.Schema.Types.ObjectId,
                                ref: 'products'
                    }
        }],
        required: true }
})

ticketSchema.pre('findOne', function () {
    this.populate("purchaser")
})
ticketSchema.pre('find', function () {
    this.populate("products.product")
})
ticketSchema.pre('findOne', function () {
    this.populate("products.product")
})

const ticketModel = mongoose.model(collectionName, ticketSchema);

export default ticketModel;