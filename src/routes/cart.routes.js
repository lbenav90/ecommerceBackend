import { Router } from 'express';
import CartManager from '../public/cartManager.js';
import ProductManager from '../public/productManager.js';

const pManager = new ProductManager('products');
const cManager = new CartManager('carts');

const router = Router();

router.post('/', async (req, res) => {
    const created = await cManager.addCart();

    const code = created.status === 'error'? 400: 200;

    res.status(code).send({ code: code, ...created })
});

router.get('/:cid', async (req, res) => {
    const id = parseInt(req.params.cid);

    const cart = await cManager.getCart(id);

    const code = cart.status === 'success'? 200: 400;
    
    res.status(code).send({ code: code, ...cart })
});

router.post('/:cid/products/:pid', async (req, res) => {
    const cid = parseInt(req.params.cid)
    const pid = parseInt(req.params.pid)
    
    const products = await pManager.getProducts();

    if (products.filter((p) => p.id === pid).length === 0) {
        // Check if the product id given exists in the list of products
        res.status(400).send({ code: 400, status: 'error', msg: 'Product id not found' })
        return;
    }

    const added = await cManager.addProduct(cid, pid);

    const code =  added.status === 'success'? 200: 400;

    res.status(code).send({ code: code, ...added })
});

export default router;