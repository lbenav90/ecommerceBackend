import productModel from "./models/products.js";
import program from "../../process.js";
import EErrors from "../errors/errors.js";
import generateErrorMessage from "../errors/error-messages.js";
import CustomError from "../errors/custom-error.js";

const PORT = program.opts().p || 8080;

export default class ProductServiceDB {
    static #instance;

    static getInstance() {
        if (!this.#instance) {
            this.#instance = new ProductServiceDB()
        }
        return this.#instance
    }

    getProducts = async (querys) => {
        const { limit, sort, query, page } = { ...querys }
        let products;

        try {
            query?
                products = await productModel.paginate(
                    { $text:{ $search: query }},
                    { 
                        limit: limit || 10,
                        sort: { price: (sort === 'asc')? 1 : -1},
                        page: page || 1
                    })
            :
                products = await productModel.paginate(
                    {},
                    { 
                        limit: limit || 10,
                        sort: { title: (sort === 'asc')? 1 : -1},
                        page: page || 1
                    })
            
            let prevLink = `https://ecommercebackend-production-29cb.up.railway.app/products?page=${products.prevPage}${sort? `&sort=${sort}` : ''}${limit? `&limit=${limit}` : ''}${query? `&query=${query}` : ''}`
            let nextLink = `https://ecommercebackend-production-29cb.up.railway.app/products?page=${products.nextPage}${sort? `&sort=${sort}` : ''}${limit? `&limit=${limit}` : ''}${query? `&query=${query}` : ''}`

            return { status: 'success', 
                    ...products, 
                    prevLink: products.prevPage? prevLink : null,
                    nextLink: products.nextPage? nextLink : null,
                };
        } catch (error) {
            CustomError.createError({
                name: "MongoDB Error",
                cause: generateErrorMessage(EErrors.MONGODB_ERROR),
                message: "Error fetching products in MongoDB",
                code: EErrors.MONGODB_ERROR
            })
        }
    }
    addProduct = async (product) => {
        if (!product || typeof(product) !== 'object') {
            CustomError.createError({
                name: "Incomplete parameters",
                cause: generateErrorMessage(EErrors.INCOMPLETE_PARAMETERS, { need: 'product', got: product}),
                message: "Missing product object when trying to add product",
                code: EErrors.INCOMPLETE_PARAMETERS
            })
        }
        try {
            let result = await productModel.create(product);
            return { status: 'success', data: result };
        } catch (error) {
            CustomError.createError({
                name: "MongoDB Error",
                cause: generateErrorMessage(EErrors.MONGODB_ERROR),
                message: "Error adding product in MongoDB",
                code: EErrors.MONGODB_ERROR
            })
        }
    }
    getProductById = async (id) => {
        if (!id) {
            CustomError.createError({
                name: "Incomplete parameters",
                cause: generateErrorMessage(EErrors.INCOMPLETE_PARAMETERS, { need: 'product id', got: id}),
                message: "Missing product id when trying to get product",
                code: EErrors.INCOMPLETE_PARAMETERS
            })
        }

        try {
            const product = await productModel.findById(id)
            return { status: 'success', data: product.toObject() }
        } catch (error) {
            CustomError.createError({
                name: "MongoDB Error",
                cause: generateErrorMessage(EErrors.MONGODB_ERROR),
                message: "Error fetching product in MongoDB",
                code: EErrors.MONGODB_ERROR
            })
        }
    }
    updateProduct = async (id, update, user) => {
        if (!id || !update || typeof(update) !== 'object') {
            CustomError.createError({
                name: "Incomplete parameters",
                cause: generateErrorMessage(EErrors.INCOMPLETE_PARAMETERS, { need: 'product id and update object', got: `${id} and ${update}`}),
                message: "Missing update information when trying to update product",
                code: EErrors.INCOMPLETE_PARAMETERS
            })
        }

        try {
            const product = await productModel.findOne({ _id: id })
            
            if (user.role !== 'admin' && product.owner && !product.owner.equals(user._id)) {
                return { status: 'error', msg: 'No se puede modificar un producto que no le pertenece' }
            }

            const upd = await productModel.updateOne({ _id: id }, update)

            return { status: 'success', data: upd }
        } catch (error) {
            CustomError.createError({
                name: "MongoDB Error",
                cause: generateErrorMessage(EErrors.MONGODB_ERROR, { error: error }),
                message: "Error updating product in MongoDB",
                code: EErrors.MONGODB_ERROR
            })
        }
    }
    updateStock = async (id, newStock) => {
        try {
            const upd = await productModel.updateOne({ _id: id }, { stock: newStock })

            return { status: 'success', data: upd }
        } catch (error) {
            CustomError.createError({
                name: "MongoDB Error",
                cause: generateErrorMessage(EErrors.MONGODB_ERROR, { error: error }),
                message: "Error updating product in MongoDB",
                code: EErrors.MONGODB_ERROR
            })
        }
    }
    deleteProduct = async (id, user) => {
        if (!id) {
            CustomError.createError({
                name: "Incomplete parameters",
                cause: generateErrorMessage(EErrors.INCOMPLETE_PARAMETERS, { need: 'product id', got: id}),
                message: "Missing product id when trying to delete product",
                code: EErrors.INCOMPLETE_PARAMETERS
            })
        }

        try {
            const product = await productModel.findOne({ _id: id })

            if (user.role !== 'admin' && product.owner && !product.owner.equals(user._id)) {
                return { status: 'error', msg: 'No se puede borrar un producto que no le pertenece' }
            }

            const del = await productModel.findByIdAndDelete(id)
            return { status: 'success', data: del }
        } catch (error) {
            CustomError.createError({
                name: "MongoDB Error",
                cause: generateErrorMessage(EErrors.MONGODB_ERROR),
                message: "Error deleting product in MongoDB",
                code: EErrors.MONGODB_ERROR
            })
        }
    }
}