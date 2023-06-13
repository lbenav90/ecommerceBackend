import userModel from './models/users.js'

export default class UserServiceDB {
    static #instance;

    static getInstance() {
        if (!this.#instance) {
            this.#instance = new UserServiceDB()
        }
        return this.#instance
    }

    getByEmail = async (email) => {
        return userModel.findOne({ email: email })
    }
    getById = async (id) => {
        return await userModel.findById(id);
    }
    create = async (user) => {
        return await userModel.create(user);
    }
}