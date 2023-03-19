import fs from 'fs';

export default class CartManager {
    constructor(path) {
        if (!path) {
            throw new Error('No path given');
        }

        this.path = path
        // Creates folder path if is doesn't exist
        fs.mkdirSync(path, { recursive: true })
    }
    async addCart() {
        /** Adds a new empty cart */
        const carts = fs.existsSync(`${this.path}/carts.json`)? JSON.parse(await fs.promises.readFile(`${this.path}/carts.json`, 'utf-8')) : [];

        try {
            await fs.promises.writeFile(`${this.path}/carts.json`, JSON.stringify([ ...carts, { id: carts.length + 1, products: [] }]))
            return {
                status: 'success',
                msg: 'Cart created successfully'
            }
        } catch (err) {
            return {
                status: 'error',
                msg: `Error while creating cart: ${err}`
            }
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

        const carts = fs.existsSync(`${this.path}/carts.json`)? JSON.parse(await fs.promises.readFile(`${this.path}/carts.json`, 'utf-8')) : [];

        // Filter for the desired cart
        const selected = carts.filter((cart) => cart.id === id);

        if (selected.length === 1) {
            return {
                status: 'success',
                msg: 'Cart retrieved successfully',
                cart: selected[0]['products']
            }
        } else {
            return {
                status: 'error',
                msg: 'Invalid id'
            }
        }
    }
    async addProduct(cartId, productId) {
        /** Adds a new product of the given productId to the cart of the given cartId.
         * If the product id already in the cart, adds one. If not, adds the products to the cart with one item
         */
        const carts = fs.existsSync(`${this.path}/carts.json`)? JSON.parse(await fs.promises.readFile(`${this.path}/carts.json`, 'utf-8')) : [];

        if (carts.length === 0) {
            return {
                status: 'error',
                msg: 'No carts were created'
            }
        }

        // Separate the cart to be modified from the others
        const unTouchedCarts = carts.filter((cart) => cart.id !== cartId);
        const touchedCart = carts.filter((cart) => cart.id === cartId)[0];

        // Separate the product to be modified from the others, if it exists
        const unTouchedProducts = touchedCart["products"].filter((product) => product.id !== productId)
        const touchedProduct = touchedCart["products"].filter((product) => product.id === productId)

        // Sets the quantity of the product depending if the product is present or not
        const quantity = touchedProduct.length === 0? 1 : touchedProduct[0]['quantity'] + 1;
        
        try {
            await fs.promises.writeFile(`${this.path}/carts.json`, JSON.stringify([
                ...unTouchedCarts, 
                { 
                    id: cartId, 
                    products: [
                        ...unTouchedProducts, 
                        { 
                            id: productId,
                            quantity: quantity
                        }
                    ]
                }
            ]))
            return {
                status: 'success',
                msg: `Added new product of id ${productId} to cart ${cartId}`
            }
        } catch (err) {
            return {
                status: 'error',
                msg: `Something went wring while adding product; ${err}`
            }
        }
    }
}