import { Router } from 'express';
import ProductManager from '../public/js/productManager.js';

const router = new Router();
const manager = new ProductManager('products');

const products = await manager.getProducts();

router.get('/', (req, res) => {
    res.render('realTimeProducts', { 
        products: products
    })
})

export default router;