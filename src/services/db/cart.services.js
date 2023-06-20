import CustomError from "../errors/custom-error.js";
import generateErrorMessage from "../errors/error-messages.js";
import EErrors from "../errors/errors.js";
import cartModel from "./models/carts.js";

const { default: ProductSeviceDB } = await import('./product.services.js')
const pManager = ProductSeviceDB.getInstance();

export default class CartServiceDB {
    static #instance;

    static getInstance() {
        if (!this.#instance) {
            this.#instance = new CartServiceDB()
        }
        return this.#instance  
    }

    getAll = async () => {
        try {
            let carts = await cartModel.find();
            return { status: 'success', data: carts.map(cart => cart.toObject()) };
        } catch (error) {
            CustomError.createError({
                name: "MongoDB Error",
                cause: generateErrorMessage(EErrors.MONGODB_ERROR),
                message: "Error fetching cart in MongoDB",
                code: EErrors.MONGODB_ERROR
            })
        }
    }
    addCart = async () => {
        try {
            let result = await cartModel.create({ products: [] });
            return { status: 'success', data: result }; 
        } catch (error) {
            CustomError.createError({
                name: "MongoDB Error",
                cause: generateErrorMessage(EErrors.MONGODB_ERROR),
                message: "Error creating cart in MongoDB",
                code: EErrors.MONGODB_ERROR
            })
        }
    }
    getCart = async (id) => {
        if (!id) {
            CustomError.createError({
                name: "Incomplete parameters",
                cause: generateErrorMessage(EErrors.INCOMPLETE_PARAMETERS, { need: 'id', got: id}),
                message: "Missing id when trying to get cart",
                code: EErrors.INCOMPLETE_PARAMETERS
            })
        }

        try {
            const cart = await cartModel.findOne({ _id: id })
            return { status: 'success', data: cart}
        } catch (error) {
            CustomError.createError({
                name: "MongoDB Error",
                cause: generateErrorMessage(EErrors.MONGODB_ERROR),
                message: "Error fetching cart in MongoDB",
                code: EErrors.MONGODB_ERROR
            })
        }
    }
    addProduct = async (cartId, productId) => {
        if (!cartId || !productId){
            CustomError.createError({
                name: "Incomplete parameters",
                cause: generateErrorMessage(EErrors.INCOMPLETE_PARAMETERS, { need: 'cartId and productId', got: `${cartId} and ${productId}`}),
                message: "Missing ids when trying to add product to cart",
                code: EErrors.INCOMPLETE_PARAMETERS
            })
        }

        const cart = await this.getCart(cartId)

        const product = await pManager.getProductById(productId);

        const inCart = cart.data.products.filter(p => p.product._id.equals(productId)).length === 1;

        if (inCart) {
            const quantity = cart.data.products.filter(p => p.product._id.equals(productId))[0].quantity
            cart.data.products = cart.data.products.filter(p => !p.product._id.equals(productId))
            cart.data.products.push({ _id : productId, product: product.data, quantity: quantity + 1 })
        } else {
            cart.data.products.push({ _id : productId, product: product.data, quantity: 1 })
        }
        
        try {
            const upd = await cartModel.updateOne({ _id: cartId }, { products: cart.data.products })
            return {status: 'success', data: upd}
        } catch (error) {
            CustomError.createError({
                name: "MongoDB Error",
                cause: generateErrorMessage(EErrors.MONGODB_ERROR),
                message: "Error adding product to cart in MongoDB",
                code: EErrors.MONGODB_ERROR
            })
        }
    }
    updateCart = async (cartId, products) => {
        if (!cartId || !products || typeof(products) !== 'object'){
            CustomError.createError({
                name: "Incomplete parameters",
                cause: generateErrorMessage(EErrors.INCOMPLETE_PARAMETERS, { need: 'cartId and product array', got: `${cartId} and ${products}`}),
                message: "Missing parameters when updating cart",
                code: EErrors.INCOMPLETE_PARAMETERS
            })
        }

        let check;
        let notValid = undefined;

        for (const product of products) {
            check = await pManager.getProductById(product._id)
            if (!check) {
                console.log(notValid);
                notValid = product.product;
            }
        }
        
        if (notValid) { 
            CustomError.createError({
                name: "Invalid product",
                cause: generateErrorMessage(EErrors.INVALID_PRODUCT, { invalid: notValid }),
                message: "Try to add product non existant in database",
                code: EErrors.INVALID_PRODUCT
            })
         }

        try {
            const upd = await cartModel.updateOne({ _id: cartId }, { products: products })
            return {status: 'success', data: upd}
        } catch (error) {
            CustomError.createError({
                name: "MongoDB Error",
                cause: generateErrorMessage(EErrors.MONGODB_ERROR),
                message: "Error updating cart in MongoDB",
                code: EErrors.MONGODB_ERROR
            })
        }
    }
    updateProduct = async (cartId, productId, quantity) => {
        if (!cartId || !productId || !quantity) {
            CustomError.createError({
                name: "Incomplete parameters",
                cause: generateErrorMessage(EErrors.INCOMPLETE_PARAMETERS, { need: 'cartId, productId and quantity', got: `${cartId}, ${productId} and ${quantity}`}),
                message: "Missing parameters when updating product in cart",
                code: EErrors.INCOMPLETE_PARAMETERS
            })
        }

        const cart = await this.getCart(cartId)

        const product = await pManager.getProductById(productId);

        const inCart = cart.data.products.filter(p => p.product._id.equals(productId)).length === 1;

        if (!inCart) {
            CustomError.createError({
                name: "Invalid product",
                cause: generateErrorMessage(EErrors.INVALID_PRODUCT_IN_CART, { invalid: productId, cart: cartId }),
                message: "Try to update product non existant in cart",
                code: EErrors.INVALID_PRODUCT_IN_CART
            })
        }
        
        try {
            cart.data.products = cart.data.products.filter(p => !p.product._id.equals(productId))
            cart.data.products.push({ _id : productId, product: product, quantity: quantity })

            const upd = await cartModel.updateOne({ _id: cartId }, { products: cart.data.products })

            return {status: 'success', data: upd}
        } catch (error) {
            CustomError.createError({
                name: "MongoDB Error",
                cause: generateErrorMessage(EErrors.MONGODB_ERROR),
                message: "Error updating product in cart in MongoDB",
                code: EErrors.MONGODB_ERROR
            })
        }
    }
    deleteProduct = async (cartId, productId) => {
        if (!cartId || !productId) {
            CustomError.createError({
                name: "Incomplete parameters",
                cause: generateErrorMessage(EErrors.INCOMPLETE_PARAMETERS, { need: 'cartId and productId', got: `${cartId} and ${productId}`}),
                message: "Missing parameters when deleting product in cart",
                code: EErrors.INCOMPLETE_PARAMETERS
            })
        }

        const cart = await this.getCart(cartId)

        const newCart = cart.data.products.filter(p => !p.product._id.equals(productId));

        if (cart.data.products.length === newCart.length) {
            CustomError.createError({
                name: "Invalid product",
                cause: generateErrorMessage(EErrors.INVALID_PRODUCT_IN_CART, { invalid: productId, cart: cartId }),
                message: "Try to delete product non existant in cart",
                code: EErrors.INVALID_PRODUCT_IN_CART
            })
        }
        
        try {
            const upd = await cartModel.updateOne({ _id: cartId }, { products: newCart })
            return {status: 'success', data: upd}
        } catch (error) {
            CustomError.createError({
                name: "MongoDB Error",
                cause: generateErrorMessage(EErrors.MONGODB_ERROR),
                message: "Error deleting product in cart in MongoDB",
                code: EErrors.MONGODB_ERROR
            })
        }
    }
    emptyCart = async (cartId) => {
        try {
            const upd = await cartModel.updateOne({ _id: cartId }, { products: [] })
            return {status: 'success', data: upd}
        } catch (error) {
            CustomError.createError({
                name: "MongoDB Error",
                cause: generateErrorMessage(EErrors.MONGODB_ERROR),
                message: "Error emptying cart in MongoDB",
                code: EErrors.MONGODB_ERROR
            })
        }
    }
}