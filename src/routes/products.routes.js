import { Router } from 'express';
import { pManager } from '../services/factory.js';
import { authUser, authorization } from '../utils.js';

const router = Router();

router.get('/', async (req, res) => {
    const products = await pManager.getProducts(req.query)

    res.status(200).send(products)
});

router.post('/', authUser, authorization(['admin']), async (req, res) => {
    const added = await pManager.addProduct(req.body);

    res.status(200).send(added)
});

router.get('/:pid', async (req, res) => {
    const id = req.params.pid;

    const product = await pManager.getProductById(id)

    res.status(200).send(product)
});

router.put('/:pid', authUser, authorization(['admin']), async (req, res) => {
    const id = req.params.pid;

    const updated = await pManager.updateProduct(id, req.body)

    res.status(200).send(updated)
});

router.delete('/:pid', authUser, authorization(['admin']), async (req, res) => {
    const id = req.params.pid;

    const deleted = await pManager.deleteProduct(id);

    res.status(200).send(deleted)

    // TODO should loop over all the carts and remove any instance of this product
});

export default router;