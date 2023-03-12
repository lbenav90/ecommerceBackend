import fs from 'fs';

export default class ProductManager {
    constructor(path) {
        if (!path) {
            throw new Error('No path given');
        }

        this.path = path;
        // Creates folder path if is doesn't exist
        fs.mkdirSync(path, { recursive: true })

        this.productKeys = ['title', 'description', 'price', 'thumbnail', 'code', 'stock'].sort() // Attributes in product. Used to check format of incoming products
    }
    async addProduct(product) {
        const productKeys = Object.keys(product).sort();

        // Check if product has the correct number of attributes 
        if (productKeys.length != this.productKeys.length ) {
            return { status: 'error', msg: "Not enough attributes. Must be in the form ['title', 'description', 'price', 'thumbnail', 'code', 'stock']"}
        }

        // Check that the attributes have the correct names
        for (let i = 0; i < productKeys.length; i++) {
            if (productKeys[i] != this.productKeys[i]){
                return {status: 'error', msg: `The product attribute "${productKeys[i]}" is not valid`};
            }
        }

        const products = await this.getProducts();

        // If the file exists, check if the new product code is already assigned
        if (products.length != 0) {
            const { code } = product;

            const codes = products.map(product => product.code);

            if (codes.includes(code)) {
                return {status: 'error', msg: "Code already exists"};
            }
        }
     
        // Get the maximum id value in the products. In case they are not sorted.
        const max_id = products.length === 0? 0: products.sort((p1, p2) => p1.id > p2.id? -1: 1)[0].id;

        await fs.promises.writeFile(`${this.path}/products.json`, JSON.stringify([...products, { id: max_id + 1, ...product }]))
    }
    async getProducts() {
        const products = fs.existsSync(`${this.path}/products.json`)? await fs.promises.readFile(`${this.path}/products.json`, 'utf-8') : JSON.stringify([]);
        return  JSON.parse(products);
    }
    async getProductById(id) {
        // Check if id is given
        if (!id && id != 0) {
            return { status: 'error', msg: "No id given"}
        }

        const products = await this.getProducts();

        if (products.length === 0) {
            return { status: 'error', msg: 'No products added'};
        }

        const selected = products.filter(product => product.id === id);

        if (selected.length != 0) {
            return selected[0];
        } else {
            return { status: 'error', msg: 'Id not found'};
        }
    }
    async updateProduct(id, update) {
        // Check if the parameters are given
        if (!id || !update) {
            throw new Error('Both parameters id and update object are needed')
        }

        if (Object.keys(update).includes('id')){
            throw new Error('Ids cannot be manually changed');
        }

        const products = await this.getProducts();

        if (products.length === 0) {
            return 'No products added';
        }

        const selected = products.filter(product => product.id === id);
        let product;
        
        // Check if the id is a valid one
        if (selected.length != 0) {
            product = selected[0];
        } else {
            throw new Error('Id Not Found');
        }
        
        // Keep the unchanged products
        const untouchedProducts = products.filter((product) => product.id != id);

        const newProduct = JSON.parse(JSON.stringify(product));
        const updatedKeys = Object.keys(update);

        // Update the selected product with the update Object
        updatedKeys.forEach((key) => {
            if (this.productKeys.includes(key)) {
                newProduct[key] = update[key];
            } else {
                throw new Error(`the key ${key} is not present in the product`)
            }
        })

        // Recombine the products with the updated one
        const newProducts = [...untouchedProducts, newProduct];

        await fs.promises.writeFile(`${this.path}/products.json`, JSON.stringify(newProducts));
    }
    async deleteProduct(id) {
        if (!id) {
            throw new Error('No Id Given');
        }

        const products = await this.getProducts();

        const newProducts = products.filter((product) => product.id != id);

        if (newProducts.length == products.length) {
            throw new Error('Id not found')
        } else {
            await fs.promises.writeFile(`${this.path}/products.json`, JSON.stringify(newProducts));
        }
    }
};