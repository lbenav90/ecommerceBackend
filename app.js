import express from 'express';
import handlebars from 'express-handlebars';
import __dirname from './utils.js';
import productRoutes from './src/routes/products.routes.js';
import cartRoutes from './src/routes/cart.routes.js';
import viewRouter from './src/routes/views.routes.js';  
import ProductManager from './src/public/js/productManager.js';
import { Server } from 'socket.io';

const app = express();
const manager = new ProductManager('products');
const PORT = 8080;

// Configuration to use JSON data
app.use(express.json())
app.use(express.urlencoded({exteded:true}))

// Set handlebars as template motor
app.engine('handlebars', handlebars.engine())
app.set('views', __dirname + '/src/views')
app.set('view engine', 'handlebars')

// Set the static file location
app.use('/static', express.static(__dirname + '/src/public'))

app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);
app.use('/realtimeproducts', viewRouter);

const products = await manager.getProducts();

app.get('/', (req, res) => {
    res.render('index', { 
        products: products
    })
})

const httpServer = app.listen(PORT, () => {
    console.log(`Server live, listining on port ${PORT}`);
})

// Create websocket server
const socketServer = new Server(httpServer);

// Open communication channel to client
socketServer.on('connection', socket => {
    console.log('New socket client connected');

    // Acá adentro va el comportamiento del websocket
})
