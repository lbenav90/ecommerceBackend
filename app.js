import express from 'express';
import handlebars from 'express-handlebars';
import __dirname from './utils.js';
import productRoutes from './src/routes/products.routes.js';
import cartRoutes from './src/routes/cart.routes.js';
import viewRouter from './src/routes/views.routes.js';  
//import ProductService from './src/dao/filesystem/product.services.js';
import ProductService from './src/dao/db/product.services.js';
import { Server } from 'socket.io';
import mongoose from 'mongoose';

const app = express();
const PORT = 8080;
const pass = 'Leobena2274';

// Configuration to use JSON data
app.use(express.json())
app.use(express.urlencoded({exteded:true}))

// Set handlebars as template motor
app.engine('handlebars', handlebars.engine({runtimeOptions: { allowProtoPropertiesByDefault: true, allowProtoMethodsByDefault: true }}))
app.set('views', __dirname + '/src/views')
app.set('view engine', 'handlebars')

// const hbs = handlebars.create({});
// hbs.handlebars.registerHelper('check', function(value, comparator) {
//     return (value === comparator) ? 'No content' : value;
// });

// Set the static file location
app.use('/static', express.static(__dirname + '/src/public'))

app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);
app.use('/realtimeproducts', viewRouter);

const connectMongoDB = async () => {
    try {
        await mongoose.connect(`mongodb+srv://leobena08:${pass}@ecommerce.zesou2s.mongodb.net/?retryWrites=true&w=majority`)
    } catch (error) {
        console.error("No se pudo conectar a la BD usando Moongose: " + error);
        process.exit();
    }
}
connectMongoDB();

const manager = new ProductService();

let products = await manager.getProducts();

app.get('/products', async (req, res) => {   
    let products = await manager.getProducts(req.query);
    
    res.render('products', { 
        products: products.docs,
        title: 'Productos',
        prev: products.prevLink,
        next: products.nextLink
    })
})

app.get('/cart', (req, res) => {
    res.render('cart', { 
        title: 'Carrito'
    })
})

const httpServer = app.listen(PORT, () => {
    console.log(`Server live, listining on port ${PORT}`);
})

// Create websocket server
const socketServer = new Server(httpServer);

// Open communication channel to client
socketServer.on('connection', async (socket) => {
    console.log('New socket client connected');

    socket.emit('products', products.data);

    socket.on('message', async (msg) => {
        products = await manager.getProducts();
        socket.emit('products', products.data);
    })
})