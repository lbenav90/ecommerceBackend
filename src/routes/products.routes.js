import { Router } from 'express';
import ProductManager from '../public/js/productManager.js';

const manager = new ProductManager('products');

const router = Router();

router.get('/', async (req, res) => {
    const limit = parseInt(req.query.limit)
    
    const products = await manager.getProducts()

    // Puse para que en el caso de limit, dé los productos en orden. Podría elegir al azar, no sabía cual era la instrucción
    res.status(200).send(limit? products.slice(0, limit) : products)
});

router.post('/', async (req, res) => {
    const added = await manager.addProduct(req.body);

    const code = added.status === 'success'? 200: 400;

    res.status(code).send({ code: code, ...added })
});

router.get('/:pid', async (req, res) => {
    const id = parseInt(req.params.pid);

    const product = await manager.getProductById(id)

    const code = product.status === 'error'? 400: 200;

    res.status(code).send({ code: code, ...product })
});

router.put('/:pid', async (req, res) => {
    const id = parseInt(req.params.pid);

    const updated = await manager.updateProduct(id, req.body)

    const code = updated.status === 'error'? 400: 200;

    res.status(code).send( { code: code, ...updated });
});

router.delete('/:pid', async (req, res) => {
    const id = parseInt(req.params.pid);

    const deleted = await manager.deleteProduct(id);

    const code = deleted.status === 'error'? 400: 200;

    res.status(code).send({ code: code, ...deleted })

    // TODO should loop over all the carts and remove any instance of this product
});

export default router;