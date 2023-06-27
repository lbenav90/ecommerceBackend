import fs from 'fs';
import __dirname, { checkType } from '../../utils.js';
import CustomError from '../errors/custom-error.js';
import EErrors from '../errors/errors.js';

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
            '_id': 'integer',
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
            CustomError.createError({
                name: "FileSystem Error",
                cause: generateErrorMessage(EErrors.FILESYSTEM_ERROR, { filepath: this.#filePath }),
                message: "Error fetching products from files",
                code: EErrors.FILESYSTEM_ERROR
            })
        }
    }

    async addProduct(product) {
        if (!product || typeof(product) !== 'object') {
            CustomError.createError({
                name: "Incomplete parameters",
                cause: generateErrorMessage(EErrors.INCOMPLETE_PARAMETERS, { need: 'product', got: product}),
                message: "Missing product infomration when adding new product",
                code: EErrors.INCOMPLETE_PARAMETERS
            })
        }

        const productKeys = Object.keys(product).sort();

        // Check if product has the correct number of attributes 
        if (productKeys.length !== Object.keys(this.productKeys).length) {
            CustomError.createError({
                name: "Invalid product information",
                cause: generateErrorMessage(EErrors.INVALID_PRODUCT_INFORMATION, { detail: 'Incorrect number of attributes'}),
                message: "Incorrect number of attributes in new product information",
                code: EErrors.INVALID_PRODUCT_INFORMATION
            })
        }

        let check;

        for (let key of productKeys) {
            // Check that the attributes have the correct names
            if (!Object.keys(this.productKeys).includes(key)){
                CustomError.createError({
                    name: "Invalid product information",
                    cause: generateErrorMessage(EErrors.INVALID_PRODUCT_INFORMATION, { detail: `The product attribute '${key}' is not valid`}),
                    message: "Invalid attribute name",
                    code: EErrors.INVALID_PRODUCT_INFORMATION
                })
            }

            if (product[key] === '') {
                CustomError.createError({
                    name: "Invalid product information",
                    cause: generateErrorMessage(EErrors.INVALID_PRODUCT_INFORMATION, { detail: `The product attribute '${key}' cannot be empty`}),
                    message: "Empty attributes no allowed",
                    code: EErrors.INVALID_PRODUCT_INFORMATION
                })
            }
            
            // Check that the attributes have the correct types
            check = checkType(product, key, this.productKeys);

            if (check.status == 'error') {
                CustomError.createError({
                    name: "Invalid product information",
                    cause: generateErrorMessage(EErrors.INVALID_PRODUCT_INFORMATION, { detail: check.msg }),
                    message: "Incorrect attribute type",
                    code: EErrors.INVALID_PRODUCT_INFORMATION
                })
            }
        }
        
        await this.getProducts();
        
        // If the file exists, check if the new product code is already assigned
        if (this.#products.length != 0) {
            const { code } = product;

            const codes = this.#products.map(product => product.code);

            if (codes.includes(code)) {
                CustomError.createError({
                    name: "Invalid product information",
                    cause: generateErrorMessage(EErrors.INVALID_PRODUCT_INFORMATION, { detail: "Code already exists" }),
                    message: "Incorrect attribute type",
                    code: EErrors.INVALID_PRODUCT_INFORMATION
                })
            }
        }
     
        // Get the maximum id value in the products. In case they are not sorted.
        const max_id = this.#products.length === 0? 1 : this.#products.sort((p1, p2) => p1._id > p2._id? -1: 1)[0]._id;

        try {
            this.#products.push({ _id: max_id + 1, ...product })
            await this.#fileSystem.promises.writeFile(this.#filePath, JSON.stringify(this.#products))
            return { status: 'success', msg: 'Product added successfully' }
        } catch (error) {
            CustomError.createError({
                name: "FileSystem Error",
                cause: generateErrorMessage(EErrors.FILESYSTEM_ERROR, { filepath: this.#filePath }),
                message: "Error adding nwe product in files",
                code: EErrors.FILESYSTEM_ERROR
            })
        }
    }
    
    async getProductById(id) {
        if (!id) {
            CustomError.createError({
                name: "Incomplete parameters",
                cause: generateErrorMessage(EErrors.INCOMPLETE_PARAMETERS, { need: 'product id', got: id}),
                message: "Missing product id when fetching product",
                code: EErrors.INCOMPLETE_PARAMETERS
            })
        }

        await this.getProducts();

        const selected = this.#products.filter(product => product.id === id);

        if (selected.length !== 0) {
            return {
                status: 'success',
                msg: 'Product found successfully',
                product: selected[0]
            }
        } else {
            CustomError.createError({
                name: "Invalid ID",
                cause: generateErrorMessage(EErrors.INVALID_ID, { invalid: id }),
                message: "Invalid id given for product",
                code: EErrors.INVALID_ID
            })
        }
    }
    async updateProduct(id, update) {
        // Check if the parameters are given
        if (!id || !update || typeof(update) !== 'object') {
            CustomError.createError({
                name: "Incomplete parameters",
                cause: generateErrorMessage(EErrors.INCOMPLETE_PARAMETERS, { need: 'product id and update information', got: `${id} and ${update}`}),
                message: "Missing udpate information when updating product",
                code: EErrors.INCOMPLETE_PARAMETERS
            })
        }

        const updatedKeys = Object.keys(update);

        if (updatedKeys.includes('_id')){
            CustomError.createError({
                name: "Invalid update",
                cause: generateErrorMessage(EErrors.INVALID_UPDATE, { field: '_id' }),
                message: "Tried to update auto field",
                code: EErrors.INVALID_UPDATE
            })
        }

        let check;
        const productKeys = Object.keys(this.productKeys);

        for (let key of updatedKeys) {
            if (!productKeys.includes(key)) {
                CustomError.createError({
                    name: "Invalid product information",
                    cause: generateErrorMessage(EErrors.INVALID_PRODUCT_INFORMATION, { detail: `The update field '${key}' is not a part of the product` }),
                    message: "Incorrect attribute type",
                    code: EErrors.INVALID_PRODUCT_INFORMATION
                })
            }
            // Check that the attributes have the correct types
            check = checkType(update, key, this.productKeys);

            if (check.status == 'error') {
                CustomError.createError({
                    name: "Invalid product information",
                    cause: generateErrorMessage(EErrors.INVALID_PRODUCT_INFORMATION, { detail: check.msg}),
                    message: "Incorrect attribute type",
                    code: EErrors.INVALID_PRODUCT_INFORMATION
                })
            }
        }

        await this.getProducts();

        const selected = this.#products.filter(product => product._id === id);
        let product;
        
        // Check if the id is a valid one
        if (selected.length !== 0) {
            product = selected[0];
        } else {
            CustomError.createError({
                name: "Invalid ID",
                cause: generateErrorMessage(EErrors.INVALID_ID, { invalid: id }),
                message: "Invalid id given for product",
                code: EErrors.INVALID_ID
            })
        }

        try {
            this.#products = this.#products.filter(p => p._id !== id)
            this.#products.push({...product, ...update})

            await fs.promises.writeFile(this.#filePath, JSON.stringify(this.#products));
            return {
                status: 'success',
                msg: 'Product updated successfully'
            }
        } catch (error) {
            CustomError.createError({
                name: "FileSystem Error",
                cause: generateErrorMessage(EErrors.FILESYSTEM_ERROR, { filepath: this.#filePath }),
                message: "Error adding new product in files",
                code: EErrors.FILESYSTEM_ERROR
            })
        }
    }
    async deleteProduct(id) {
        if (!id) {
            CustomError.createError({
                name: "Incomplete parameters",
                cause: generateErrorMessage(EErrors.INCOMPLETE_PARAMETERS, { need: 'product id', got: id}),
                message: "Missing product id when deleting product",
                code: EErrors.INCOMPLETE_PARAMETERS
            })
        }

        await this.getProducts();

        const newProducts = this.#products.filter((product) => product.id != id);

        if (newProducts.length == this.#products.length) {
            CustomError.createError({
                name: "Invalid ID",
                cause: generateErrorMessage(EErrors.INVALID_ID, { invalid: id }),
                message: "Invalid id given for product",
                code: EErrors.INVALID_ID
            })
        }
        
        try {
            await fs.promises.writeFile(this.#filePath, JSON.stringify(newProducts));
            this.#products = newProducts;
            return {
                status: 'success',
                msg: 'Item deleted succesfully'
            }
        } catch (error) {
            CustomError.createError({
                name: "FileSystem Error",
                cause: generateErrorMessage(EErrors.FILESYSTEM_ERROR, { filepath: this.#filePath }),
                message: "Error deleting product in files",
                code: EErrors.FILESYSTEM_ERROR
            })
        }
    }
};