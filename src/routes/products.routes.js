import { Router } from 'express';
import { cManager, pManager } from '../services/factory.js';
import { authUser, authorization } from '../utils.js';

const router = Router();

router.get('/', async (req, res) => {
    const products = await pManager.getProducts(req.query)

    res.status(200).send(products)
});

router.post('/', authUser, authorization(['premium', 'admin']), async (req, res) => {
    await pManager.addProduct({ ...req.body, owner: req.user._id, status: true });

    res.redirect('/products')
});

router.get('/:pid', async (req, res) => {
    const id = req.params.pid;

    const product = await pManager.getProductById(id)

    res.status(200).send(product)
});

router.post('/:pid', authUser, authorization(['premium', 'admin']), async (req, res) => {
    const id = req.params.pid;

    const update = await pManager.updateProduct(id, req.body, req.user)

    if (update.status === 'success') {
        res.redirect('/products')
    } else {
        res.redirect(req.header('Referer'))
    }
});

router.put('/:pid', authUser, authorization(['premium', 'admin']), async (req, res) => {
    const id = req.params.pid;

    const updated = await pManager.updateProduct(id, req.body, req.user)

    res.status(200).send(updated)
});

router.delete('/:pid', authUser, authorization(['premium', 'admin']), async (req, res) => {
    const id = req.params.pid;

    const carts = await cManager.getAll();
    
    carts.data.forEach(async (cart) => {
        if (cart.products.filter(p => p._id.equals(id)).length === 1) {
            await cManager.updateCart(cart._id, cart.products.filter(p => !p._id.equals(id)))
        }
    })
    
    const deleted = await pManager.deleteProduct(id, req.user);

    res.status(200).send(deleted)
});

export default router;