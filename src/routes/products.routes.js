import { Router } from 'express';
import ProductService from '../dao/db/product.services.js';
// import ProductService from '../dao/filesystem/product.services.js';

const manager = new ProductService();

const router = Router();

router.get('/', async (req, res) => {
    const products = await manager.getProducts(req.query)

    const code = products.status === 'success'? 200 : 400;

    res.status(code).send(products)
});

router.post('/', async (req, res) => {
    const added = await manager.addProduct(req.body);

    const code = added.status === 'success'? 200: 400;

    res.status(code).send({ code: code, ...added })
});

router.get('/:pid', async (req, res) => {
    const id = req.params.pid;

    const product = await manager.getProductById(id)

    const code = product.status === 'error'? 400: 200;

    res.status(code).send({ code: code, ...product })
});

router.put('/:pid', async (req, res) => {
    const id = req.params.pid;

    const updated = await manager.updateProduct(id, req.body)

    const code = updated.status === 'error'? 400: 200;

    res.status(code).send( { code: code, ...updated });
});

router.delete('/:pid', async (req, res) => {
    const id = req.params.pid;

    const deleted = await manager.deleteProduct(id);

    const code = deleted.status === 'error'? 400: 200;

    res.status(code).send({ code: code, ...deleted })

    // TODO should loop over all the carts and remove any instance of this product
});

export default router;