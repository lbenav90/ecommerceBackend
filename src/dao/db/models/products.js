import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const collectionName = 'products';

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    thumbnail: { type: String, required: true },
    code: { type: String, required: true },
    stock: { type: Number, required: true },
    category: { type: String, required: true },
    status: { type: Boolean, required: true }
})

productSchema.plugin(mongoosePaginate);
productSchema.index({ type: 'text', 'category': 'text'});

const productModel = mongoose.model(collectionName, productSchema);

export default productModel;