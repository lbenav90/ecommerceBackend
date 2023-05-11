import cartModel from "./models/carts.js";
import productModel from "./models/products.js";

export default class CartService {
    constructor() { 
    }

    getAll = async () => {
        try {
            let carts = await cartModel.find();
            return { status: 'success', data: carts.map(cart=>cart.toObject())};
        } catch (error) {
            return { status: 'error', msg: error}
        }
    }
    addCart = async (cart) => {
        try {
            let result = await cartModel.create(cart);
            return { status: 'success', data: result };
        } catch (error) {
            return { status: 'error', msg: error}
        }
    }
    getCart = async (id) => {
        if (!id) {
            console.error('Id no ingresado')
            throw new Error('Id no ingresado')
        }

        try {
            const cart = await cartModel.findOne({ _id: id })
            return { status: 'success', data: cart}
        } catch (error) {
            return { status: 'error', msg: error}
        }
    }
    addProduct = async (cartId, productId) => {
        const cart = await this.getCart(cartId)
        if (cart.status === 'error') { return cart }

        const product = await productModel.findById(productId);
        if (product.status === 'error') { return product }

        const inCart = cart.data.products.filter(p => p.product._id.equals(productId)).length === 1;

        if (inCart) {
            const quantity = cart.data.products.filter(p => p.product._id.equals(productId))[0].quantity
            cart.data.products = cart.data.products.filter(p => !p.product._id.equals(productId))
            cart.data.products.push({ _id : productId, product: product, quantity: quantity + 1 })
        } else {
            cart.data.products.push({ _id : productId, product: product, quantity: 1 })
        }
        
        try {
            const upd = await cartModel.updateOne({ _id: cartId }, { products: cart.data.products })
            return {status: 'success', data: upd}
        } catch (error) {
            return {status: 'error', msg : error}
        }
    }
    updateCart = async (cartId, products) => {
        let check;
        let notValid = undefined;
        for (const product of products) {
            check = await productModel.findById(product.product)
            if (!check) {
                console.log(notValid);
                notValid = product.product;
            }
        }
        console.log(notValid, 8);
        
        if (notValid) { return { status: 'error', msg: `Producto de id ${notValid} no es válido`} }

        try {
            const upd = await cartModel.updateOne({ _id: cartId }, { products: products })
            return {status: 'success', data: upd}
        } catch (error) {
            return {status: 'error', msg : error}
        }
    }
    updateProduct = async (cartId, productId, quantity) => {
        const cart = await this.getCart(cartId)
        if (cart.status === 'error') { return cart }

        const product = await productModel.findById(productId);
        if (product.status === 'error') { return product }

        const inCart = cart.data.products.filter(p => p.product._id.equals(productId)).length === 1;

        if (!inCart) {
            return {status: 'error', msg : 'Product not in cart'}
        }
        
        try {
            cart.data.products = cart.data.products.filter(p => !p.product._id.equals(productId))
            cart.data.products.push({ _id : productId, product: product, quantity: quantity })

            const upd = await cartModel.updateOne({ _id: cartId }, { products: cart.data.products })
            return {status: 'success', data: upd}
        } catch (error) {
            return {status: 'error', msg : error}
        }
    }
    deleteProduct = async (cartId, productId) => {
        const cart = await this.getCart(cartId)
        if (cart.status === 'error') { return cart }

        const product = await productModel.findById(productId);
        if (product.status === 'error') { return product }

        const newCart = cart.data.products.filter(p => !p.product._id.equals(productId));

        if (cart.data.products.length === newCart.length) {
            return {status: 'error', msg : 'El carrito no incluye ese producto'}
        }
        
        try {
            const upd = await cartModel.updateOne({ _id: cartId }, { products: newCart })
            return {status: 'success', data: upd}
        } catch (error) {
            return {status: 'error', msg : error}
        }
    }
    emptyCart = async (cartId) => {
        try {
            const upd = await cartModel.updateOne({ _id: cartId }, { products: [] })
            return {status: 'success', data: upd}
        } catch (error) {
            return {status: 'error', msg : error}
        }
    }
}