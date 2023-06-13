import fs from 'fs';
import __dirname, { checkType } from '../../utils.js';

export default class ProductServiceFile {
    static #instance;
    #products;
    #dirPath;
    #filePath;
    #fileSystem;

    constructor() {
        this.#products = new Array();
        this.#dirPath = __dirname + '/files/products';
        this.#filePath = this.#dirPath + '/products.json';
        this.#fileSystem = fs;

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

    static getInstance() {
        if (!this.#instance) {
            this.#instance = new ProductServiceFile()
        }
        return this.#instance
    }

    async #setDirectory() {
        await this.#fileSystem.promises.mkdir(this.#dirPath, {recursive: true});
        if (!this.#fileSystem.existsSync(this.#filePath)) {
            await this.#fileSystem.promises.writeFile(this.#filePath, [])
        }
    }

    async getProducts() {
        try {
            await this.#setDirectory();
            const data = await this.#fileSystem.promises.readFile(this.#filePath, 'utf-8');
            this.#products = JSON.parse(data);

            return { status: 'success', data: this.#products };
        } catch (error) {
            console.error(`Error consultando los productos por archivo, valide el archivo: ${this.#dirPath}, detalle del error: ${error}`);
            throw Error(`Error consultando los productos por archivo, valide el archivo: ${this.#dirPath}, detalle del error: ${error}`);
        }
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
        
        await this.getProducts();
        
        // If the file exists, check if the new product code is already assigned
        if (this.#products.length != 0) {
            const { code } = product;

            const codes = this.#products.map(product => product.code);

            if (codes.includes(code)) {
                return {
                    status: 'error', 
                    msg: "Code already exists"
                };
            }
        }
     
        // Get the maximum id value in the products. In case they are not sorted.
        const max_id = this.#products.length === 0? 0: this.#products.sort((p1, p2) => p1.id > p2.id? -1: 1)[0].id;

        try {
            this.#products.push({ id: max_id + 1, ...product })
            await this.#fileSystem.promises.writeFile(this.#filePath, JSON.stringify(this.#products))
            return {
                status: 'success',
                msg: 'Product added successfully'
            }
        } catch (error) {
            return {
                status: 'error',
                msg: `Something went wrong while adding the product: ${error}`
            }
        }
    }
    
    async getProductById(id) {
        // Check if id is given
        if (!id && id != 0) {
            return { status: 'error', msg: "No id given"}
        }

        await this.getProducts();

        if (this.#products.length === 0) {
            return { 
                status: 'error', 
                msg: 'No products added'
            };
        }

        const selected = this.#products.filter(product => product.id === id);

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

       await this.getProducts();

        if (this.#products.length === 0) {
            // Might be useless since the id check is gonna fail anyway
            return {
                status: 'error',
                msg: 'No products added'
            }
        }

        const selected = this.#products.filter(product => product.id === id);
        let product;
        
        // Check if the id is a valid one
        if (selected.length !== 0) {
            product = selected[0];
        } else {
            return {
                status: 'error',
                msg: 'Id not found'
            }
        }

        try {
            console.log(this.#products.filter(p => p.id !== id).push({...product, ...update}));
            this.#products = this.#products.filter(p => p.id !== id)
            this.#products.push({...product, ...update})

            await fs.promises.writeFile(this.#filePath, JSON.stringify(this.#products));
            return {
                status: 'success',
                msg: 'Product updated successfully'
            }
        } catch (error) {
            return {
                status: 'error',
                msg: `Something went wrong while saving the changes: ${error}`
            }
        }
    }
    async deleteProduct(id) {
        if (!id && id != 0) {
            throw new Error('No Id Given');
        }

        await this.getProducts();

        const newProducts = this.#products.filter((product) => product.id != id);

        if (newProducts.length == this.#products.length) {
            return {
                status: 'error',
                msg: 'Id not found'
            }
        }
        
        try {
            await fs.promises.writeFile(this.#filePath, JSON.stringify(newProducts));
            this.#products = newProducts;
            return {
                status: 'success',
                msg: 'Item deleted succesfully'
            }
        } catch (error) {
            return {
                status: 'error',
                msg: `Something went wrong while deleting product: ${error}`
            }
        }
        
    }
};