import express from 'express';
import __dirname from './utils.js';
import productRoutes from './src/routes/products.routes.js';
import cartRoutes from './src/routes/cart.routes.js';

const app = express();
const PORT = 8080;

app.use(express.json())
app.use(express.urlencoded({exteded:true}))

app.use('/static', express.static(__dirname + '/public'))

app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);

app.listen(PORT, () => {
    console.log(`Server live, listining on port ${PORT}`);
})