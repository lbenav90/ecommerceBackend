import express from 'express';
import ProductManager from './productManager.js';

const app = express();
const PORT = 8080;

app.use(express.json())
app.use(express.urlencoded({exteded:true}))

const manager = new ProductManager('products');

app.get('/products', async (req, res) => {
    const limit = parseInt(req.query.limit)
    
    const products = await manager.getProducts()

    // Puse para que en el caso de limit, dé los productos en orden. Podría elegir al azar, no sabía cual era la instrucción
    res.send(limit? products.slice(0, limit) : products)
})

app.get('/products/:pid', async (req, res) => {
    const id = parseInt(req.params.pid);

    const product = await manager.getProductById(id)

    res.send(product)
})

app.listen(PORT, () => {
    console.log(`Server live, listining on port ${PORT}`);
})