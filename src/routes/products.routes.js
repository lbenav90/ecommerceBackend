import { Router } from 'express';
import { pManager } from '../services/factory.js';
import { authUser, authorization } from '../utils.js';

const router = Router();

router.get('/', async (req, res) => {
    const products = await pManager.getProducts(req.query)

    const code = products.status === 'success'? 200 : 400;

    res.status(code).send(products)
});

router.post('/', authUser, authorization(['admin']), async (req, res) => {
    const added = await pManager.addProduct(req.body);

    const code = added.status === 'success'? 200: 400;

    res.status(code).send({ code: code, ...added })
});

router.get('/:pid', async (req, res) => {
    const id = req.params.pid;

    const product = await pManager.getProductById(id)

    const code = product.status === 'error'? 400: 200;

    res.status(code).send({ code: code, ...product })
});

router.put('/:pid', authUser, authorization(['admin']), async (req, res) => {
    const id = req.params.pid;

    const updated = await pManager.updateProduct(id, req.body)

    const code = updated.status === 'error'? 400: 200;

    res.status(code).send( { code: code, ...updated });
});

router.delete('/:pid', authUser, authorization(['admin']), async (req, res) => {
    const id = req.params.pid;

    const deleted = await pManager.deleteProduct(id);

    const code = deleted.status === 'error'? 400: 200;

    res.status(code).send({ code: code, ...deleted })

    // TODO should loop over all the carts and remove any instance of this product
});

export default router;