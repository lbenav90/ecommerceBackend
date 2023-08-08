import mongoose from "mongoose";

const userCollection = 'users';

const userSchema = new mongoose.Schema({
    first_name: { type: String},
    last_name: { type: String },
    email: { type: String, unique: true },
    age: { type: Number },
    password: { type: String },
    cart: { type: mongoose.Schema.Types.ObjectId,
            ref: 'carts',
            required: true },
    role: { type: String, default: 'user', enum: ['user', 'admin', 'premium'] },
    loggedBy: String,
    documents: { type: [{
                    name: { type: String, required: true},
                    reference: { type: String, required: true }
                }], 
                default: []},
    last_connection: { type: Date, required: true, default: new Date() }
})

userSchema.pre('find', function () {
    this.populate("cart")
})

const userModel = mongoose.model(userCollection, userSchema);

export default userModel;