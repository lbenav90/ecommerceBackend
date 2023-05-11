import productModel from "./models/products.js";

export default class ProductService {
    constructor() { 
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
            
            let prevLink = `http://localhost:8080/products?page=${products.prevPage}${sort? `&sort=${sort}` : ''}${limit? `&limit=${limit}` : ''}${query? `&query=${query}` : ''}`
            let nextLink = `http://localhost:8080/products?page=${products.nextPage}${sort? `&sort=${sort}` : ''}${limit? `&limit=${limit}` : ''}${query? `&query=${query}` : ''}`

            return { status: 'success', 
                    ...products, 
                    prevLink: products.prevPage? prevLink : null,
                    nextLink: products.nextPage? nextLink : null,
                };
        } catch (error) {
            return { status: 'error', msg: error}
        }
    }
    addProduct = async (product) => {
        try {
            let result = await productModel.create(product);
            return { status: 'success', data: result };
        } catch (error) {
            return { status: 'error', msg: error}
        }
    }
    getProductById = async (id) => {
        try {
            const product = await productModel.findById(id)
            return { status: 'success', data: product.toObject() }
        } catch (error) {
            return { status: 'error', msg: error}
        }
    }
    updateProduct = async (id, update) => {
        try {
            const upd = await productModel.updateOne({ _id: id }, update)
            return { status: 'success', data: upd }
        } catch (error) {
            return { status: 'error', msg: error}
        }
    }
    deleteProduct = async (id) => {
        try {
            const del = await productModel.findByIdAndDelete(id)
            return { status: 'success', data: del }
        } catch (error) {
            return { status: 'error', msg: error}
        }
    }
}