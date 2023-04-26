import { Router } from 'express';
import CartService from '../dao/db/cart.services.js';
import ProductService from '../dao/db/product.services.js';
//import CartService from '../dao/filesystem/cart.services.js';
//import ProductService from '../dao/filesystem/product.services.js';

const pService = new ProductService();
const cService = new CartService();

const router = Router();

router.post('/', async (req, res) => {
    const created = await cService.addCart();

    const code = created.status === 'success'? 200 : 400;

    res.status(code).send({ code: code, ...created })
});

router.get('/:cid', async (req, res) => {
    const id = req.params.cid;

    const cart = await cService.getCart(id);

    const code = cart.status === 'success'? 200: 400;
    
    res.status(code).send({ code: code, ...cart })
});

router.delete('/:cid', async (req, res) => {
    const id = req.params.cid;
    
    const del = await cService.emptyCart(id);
    
    const code = del.status === 'success'? 200: 400;
    
    res.status(code).send({ code: code, ...del })
})

router.put('/:cid', async (req, res) => {
    const id = req.params.cid;
    
    const products = req.body;
    
    const added = await cService.updateCart(id, products);
    
    const code = added.status === 'success'? 200: 400;
    
    res.status(code).send({ code: code, ...added })
})

router.post('/:cid/products/:pid', async (req, res) => {
    const cid = req.params.cid
    const pid = req.params.pid
    
    const product = await pService.getProductById(pid);

    if (product.status === 'error') {
        // Check if the product id given exists in the list of products
        res.status(400).send({ code: 400, ...product })
        return;
    }

    const added = await cService.addProduct(cid, pid);

    const code =  added.status === 'success'? 200: 400;

    res.status(code).send({ code: code, ...added })
});

router.put('/:cid/products/:pid', async (req, res) => {
    const cid = req.params.cid
    const pid = req.params.pid

    const { quantity } = req.body

    const upd = await cService.updateProduct(cid, pid, quantity)
    
    const code = upd.status === 'success'? 200: 400;
    
    res.status(code).send({ code: code, ...upd })
});

router.delete('/:cid/products/:pid', async (req, res) => {
    const cid = req.params.cid
    const pid = req.params.pid

    const del = await cService.deleteProduct(cid, pid)

    const code = del.status === 'success'? 200: 400;

    res.status(code).send({ code: code, ...del })
})

export default router;