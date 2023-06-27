import fs from 'fs';
import __dirname from '../../utils.js';
import CustomError from '../errors/custom-error.js';
import generateErrorMessage from '../errors/error-messages.js';
import EErrors from '../errors/errors.js';

const { default: ProductSeviceFile } = await import('./product.services.js')
const pManager = ProductSeviceFile.getInstance();

export default class CartServiceFile {
    static #instance;
    #carts;
    #dirPath;
    #filePath;
    #fileSystem;

    constructor() {
        this.#carts = new Array();
        this.#dirPath = __dirname + '/files/carts';
        this.#filePath = this.#dirPath + '/carts.json';
        this.#fileSystem = fs;
    }

    static getInstance() {
        if (!this.#instance) {
            this.#instance = new CartServiceFile()
        }
        return this.#instance
    }

    async #setDirectory() {
        await this.#fileSystem.promises.mkdir(this.#dirPath, {recursive: true});
        if (!this.#fileSystem.existsSync(this.#filePath)) {
            await this.#fileSystem.promises.writeFile(this.#filePath, JSON.stringify([]))
        }
    }

    async getAll() {
        try {
            await this.#setDirectory();

            const data = await this.#fileSystem.promises.readFile(this.#filePath, 'utf-8');
            this.#carts = JSON.parse(data)

            return { status: 'success', data: this.#carts}
        } catch (error) {
            CustomError.createError({
                name: "FileSystem Error",
                cause: generateErrorMessage(EErrors.FILESYSTEM_ERROR, { filepath: this.#filePath }),
                message: "Error fetching carts from files",
                code: EErrors.FILESYSTEM_ERROR
            })
        }
    }

    async addCart() {
        /** Adds a new empty cart */
        await this.getAll()

        try {
            this.#carts.push({ id: this.#carts.length + 1, products: [] })

            await this.#fileSystem.promises.writeFile(this.#filePath, JSON.stringify(this.#carts))
            return { status: 'success', data: this.#carts }
        } catch (error) {
            CustomError.createError({
                name: "FileSystem Error",
                cause: generateErrorMessage(EErrors.FILESYSTEM_ERROR, { filepath: this.#filePath }),
                message: "Error adding cart to files",
                code: EErrors.FILESYSTEM_ERROR
            })
        }
    }

    async getCart(id) {
        /** Gets the cart information of the given id. Returns a an objecto with the selected cart if it exists */
        if (!id) {
            CustomError.createError({
                name: "Incomplete parameters",
                cause: generateErrorMessage(EErrors.INCOMPLETE_PARAMETERS, { need: 'id', got: id}),
                message: "Missing id when trying to get cart",
                code: EErrors.INCOMPLETE_PARAMETERS
            })
        }

        await this.getAll();

        // Filter for the desired cart
        const selected = this.#carts.filter((cart) => cart.id === id);
        const data = (selected.length === 1)? selected[0] : 'Invalid id';

        return { status: 'success', data: data }
    }

    async addProduct(cartId, productId) {
        /** Adds a new product of the given productId to the cart of the given cartId.
         * If the product id already in the cart, adds one. If not, adds the products to the cart with one item
         */

        if (!cartId || !productId){
            CustomError.createError({
                name: "Incomplete parameters",
                cause: generateErrorMessage(EErrors.INCOMPLETE_PARAMETERS, { need: 'cartId and productId', got: `${cartId} and ${productId}`}),
                message: "Missing ids when trying to add product to cart",
                code: EErrors.INCOMPLETE_PARAMETERS
            })
        }
        await this.getAll();

        if (this.#carts.length === 0) {
            return {
                status: 'error',
                msg: 'No carts were created'
            }
        }

        // Separate the cart to be modified from the others
        const cart = await this.getCart(cartId);

        // Separate the product to be modified from the others, if it exists
        const product = cart.data.products.filter(p => p.id === productId)

        // Sets the quantity of the product depending if the product is present or not
        if (product.length === 0) {
            cart.data.products.push({ id: productId, quantity: 1 })
        } else {
            cart.data.products = cart.data.products.filter(p => p.id !== productId)
            cart.data.products.push( {id: productId, quantity: product[0]['quantity'] + 1 })
        }

        try {
            await fs.promises.writeFile(this.#filePath, JSON.stringify(this.#carts))
            return {
                status: 'success',
                msg: `Added new product of id ${productId} to cart ${cartId}`
            }
        } catch (error) {
            CustomError.createError({
                name: "FileSystem Error",
                cause: generateErrorMessage(EErrors.FILESYSTEM_ERROR, { filepath: this.#filePath }),
                message: "Error adding product to cart in files",
                code: EErrors.FILESYSTEM_ERROR
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
                logger.warning(`Invalid product with id ${product._id}`);
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
            await this.getAll();    
            
            this.#carts = [ ...this.#carts.filter(c => c._id !== cartId), { _id: cartId, products: products } ]
            
            await fs.promises.writeFile(this.#filePath, JSON.stringify(this.#carts))

            return {status: 'success', data: this.#carts}
        } catch (error) {
            CustomError.createError({
                name: "FileSystem Error",
                cause: generateErrorMessage(EErrors.FILESYSTEM_ERROR, { filepath: this.#filePath }),
                message: "Error updating cart in files",
                code: EErrors.FILESYSTEM_ERROR
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

            await this.getAll();    
            
            this.#carts = [ ...this.#carts.filter(c => c._id !== cartId), { _id: cartId, products: cart.data.products } ]
            
            await fs.promises.writeFile(this.#filePath, JSON.stringify(this.#carts))

            return {status: 'success', data: this.#carts}
        } catch (error) {
            CustomError.createError({
                name: "FileSystem Error",
                cause: generateErrorMessage(EErrors.FILESYSTEM_ERROR, { filepath: this.#filePath }),
                message: "Error updating product in cart in files",
                code: EErrors.FILESYSTEM_ERROR
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
            await this.getAll();    
            
            this.#carts = [ ...this.#carts.filter(c => c._id !== cartId), { _id: cartId, products: newCart } ]
            
            await fs.promises.writeFile(this.#filePath, JSON.stringify(this.#carts))
            
            return {status: 'success', data: this.#carts}
        } catch (error) {
            CustomError.createError({
                name: "FileSystem Error",
                cause: generateErrorMessage(EErrors.FILESYSTEM_ERROR, { filepath: this.#filePath }),
                message: "Error deleting product from cart in files",
                code: EErrors.FILESYSTEM_ERROR
            })
        }
    }
    emptyCart = async (cartId) => {
        if (!cartId) {
            CustomError.createError({
                name: "Incomplete parameters",
                cause: generateErrorMessage(EErrors.INCOMPLETE_PARAMETERS, { need: 'cartId', got: cartId}),
                message: "Missing parameters when emptying cart",
                code: EErrors.INCOMPLETE_PARAMETERS
            })
        }

        try {
            await this.getAll();    
            
            this.#carts = [ ...this.#carts.filter(c => c._id !== cartId), { _id: cartId, products: [] } ]
            
            await fs.promises.writeFile(this.#filePath, JSON.stringify(this.#carts))
            
            return {status: 'success', data: this.#carts}
        } catch (error) {
            CustomError.createError({
                name: "FileSystem Error",
                cause: generateErrorMessage(EErrors.FILESYSTEM_ERROR, { filepath: this.#filePath }),
                message: "Error emptying cart in files",
                code: EErrors.FILESYSTEM_ERROR
            })
        }
    }
}