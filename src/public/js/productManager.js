import fs from 'fs';
import { checkType } from '../../../utils.js';

export default class ProductManager {
    constructor(path) {
        if (!path) {
            throw new Error('A path to the products folder is needed to create a new ProductManager');
        }

        this.path = path;
        // Creates folder path if is doesn't exist
        fs.mkdirSync(path, { recursive: true })

        this.productKeys = {
            'title': 'string', 
            'description': 'string', 
            'price': 'float', 
            'thumbnail': 'string', 
            'code': 'string', 
            'stock': 'integer', 
            'category': 'string', 
            'status': 'boolean'
        } // Attributes in products and corresponding types
    }
    async addProduct(product) {
        const productKeys = Object.keys(product).sort();

        // Check if product has the correct number of attributes 
        if (productKeys.length != Object.keys(this.productKeys).length) {
            return { 
                status: 'error', 
                msg: "Incorrect number of attributes. Must have the attributes [title, description, price, thumbnail, code, stock, status, category]"
            }
        }

        let check;

        for (let key of productKeys) {
            // Check that the attributes have the correct names
            if (!Object.keys(this.productKeys).includes(key)){
                return {
                    status: 'error', 
                    msg: `The product attribute '${key}' is not valid`
                };
            }

            if (product[key] === '') {
                return {
                    status: 'error', 
                    msg: `The product attribute '${key}' cannot be empty`
                };
            }
            
            // Check that the attributes have the correct types
            check = checkType(product, key, this.productKeys);

            if (check.status == 'error') {
                return check;
            }
        }
        
        const products = await this.getProducts();
        
        // If the file exists, check if the new product code is already assigned
        if (products.length != 0) {
            const { code } = product;

            const codes = products.map(product => product.code);

            if (codes.includes(code)) {
                return {
                    status: 'error', 
                    msg: "Code already exists"
                };
            }
        }
     
        // Get the maximum id value in the products. In case they are not sorted.
        const max_id = products.length === 0? 0: products.sort((p1, p2) => p1.id > p2.id? -1: 1)[0].id;

        try { 
            await fs.promises.writeFile(`${this.path}/products.json`, JSON.stringify([...products, { id: max_id + 1, ...product }]))
            return {
                status: 'success',
                msg: 'Product added successfully'
            }
        } catch (err) {
            return {
                status: 'error',
                msg: `Something went wrong while adding the product: ${err}`
            }
        }
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
            return { 
                status: 'error', 
                msg: 'No products added'
            };
        }

        const selected = products.filter(product => product.id === id);

        if (selected.length !== 0) {
            return {
                status: 'success',
                msg: 'Product found successfully',
                product: selected[0]
            }
        } else {
            return { 
                status: 'error', 
                msg: 'Id not found'
            };
        }
    }
    async updateProduct(id, update) {
        // Check if the parameters are given
        if (!id || !update) {
            return {
                status: 'error',
                msg: 'Id and Update object must be provided'
            }
        }

        const updatedKeys = Object.keys(update);

        if (updatedKeys.includes('id')){
            return {
                status: 'error',
                msg: 'Ids cannot be manually changed'
            }
        }

        let check;
        const productKeys = Object.keys(this.productKeys);

        for (let key of updatedKeys) {
            if (!productKeys.includes(key)) {
                return {
                    status: 'error',
                    msg: `The update field '${key}' is not a part of the product`
                }
            }
            // Check that the attributes have the correct types
            check = checkType(update, key, this.productKeys);

            if (check.status == 'error') {
                return check;
            }
        }

        const products = await this.getProducts();

        if (products.length === 0) {
            // Might be useless since the id check is gonna fail anyway
            return {
                status: 'error',
                msg: 'No products added'
            }
        }

        const selected = products.filter(product => product.id === id);
        let product;
        
        // Check if the id is a valid one
        if (selected.length != 0) {
            product = selected[0];
        } else {
            return {
                status: 'error',
                msg: 'Id not found'
            }
        }
        
        // Keep the unchanged products
        const untouchedProducts = products.filter((product) => product.id != id);

        const newProduct = JSON.parse(JSON.stringify(product));

        // Update the selected product with the update Object
        updatedKeys.forEach((key) => {
            if (Object.keys(this.productKeys).includes(key)) {
                newProduct[key] = update[key];
            } else {
                return {
                    status: 'error',
                    msg: `The key ${key} is not present in the product`
                }
            }
        })

        // Recombine the products with the updated one
        const newProducts = [...untouchedProducts, newProduct];

        try {
            await fs.promises.writeFile(`${this.path}/products.json`, JSON.stringify(newProducts));
            return {
                status: 'success',
                msg: 'Product updated successfully'
            }
        } catch (err) {
            return {
                status: 'error',
                msg: `Something went wrong while saving the changes: ${err}`
            }
        }
    }
    async deleteProduct(id) {
        if (!id && id != 0) {
            throw new Error('No Id Given');
        }

        const products = await this.getProducts();

        const newProducts = products.filter((product) => product.id != id);

        if (newProducts.length == products.length) {
            return {
                status: 'error',
                msg: 'Id not found'
            }
        }
        
        try {
            await fs.promises.writeFile(`${this.path}/products.json`, JSON.stringify(newProducts));
            return {
                status: 'success',
                msg: 'Item deleted succesfully'
            }
        } catch (err) {
            return {
                status: 'error',
                msg: `Something went wrong while deleting product: ${err}`
            }
        }
        
    }
};