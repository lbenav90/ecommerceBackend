import mongoose from "mongoose";

const collectionName = 'tokens';

const tokenSchema = new mongoose.Schema({
    email: {
        type: 'String',
        required: true
    },
    token: {
        type: 'String',
        required: true
    },
    createdAt: {
        type: Date,
        default:  Date.now(),
        expires: 3600
    }
})

const tokenModel = mongoose.model(collectionName, tokenSchema);

export default tokenModel;