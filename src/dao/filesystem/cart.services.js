import fs from 'fs';
import __dirname from '../../../utils.js';

export default class CartService {
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
            console.error(`Error consultando los carritos por archivo, valide el archivo: ${this.#dirPath}, detalle del error: ${error}`);
            throw Error(`Error consultando los carritos por archivo, valide el archivo: ${this.#dirPath}, detalle del error: ${error}`);
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
            console.error(`Error creando nuevo carrito, detalle del error: ${error}`);
            throw Error(`Error creando nuevo, detalle del error: ${error}`);
        }
    }

    async getCart(id) {
        /** Gets the cart information of the given id. Returns a an objecto with the selected cart if it exists */
        if (!id) {
            return {
                status: 'error',
                msg: 'Id must be provided'
            }
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
            return {
                status: 'error',
                msg: `Something went wring while adding product; ${err}`
            }
        }
    }
}