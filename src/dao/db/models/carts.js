import mongoose from 'mongoose';

const collectionName = 'carts';

const cartSchema = new mongoose.Schema({
    products: { 
        type: [{
                    product: {
                                type: mongoose.Schema.Types.ObjectId,
                                ref: 'products'
                    },
                    quantity: Number
        }], 
        default: [], 
        required: true }
})

cartSchema.pre('find', function () {
    this.populate("products.product")
})
cartSchema.pre('findOne', function () {
    this.populate("products.product")
})

const cartModel = mongoose.model(collectionName, cartSchema)

export default cartModel;