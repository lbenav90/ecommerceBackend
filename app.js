import express from 'express';
import handlebars from 'express-handlebars';
import __dirname from './utils.js';
import productRoutes from './src/routes/products.routes.js';
import cartRoutes from './src/routes/cart.routes.js';
import viewRouter from './src/routes/views.routes.js';  
import userRouter from './src/routes/user.routes.js';  
import sessionRouter from './src/routes/session.routes.js';
import gitHubLoginViewRouter from './src/routes/github-login.routes.js'
//import ProductService from './src/dao/filesystem/product.services.js';
import ProductService from './src/dao/db/product.services.js';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import CartService from './src/dao/db/cart.services.js';
import passport from 'passport';
import initializePassport from './src/config/passport.config.js';

const app = express();
const PORT = 8080;
const pass = 'Leobena2274';
const MONGO_URL = `mongodb+srv://leobena08:${pass}@ecommerce.zesou2s.mongodb.net/?retryWrites=true&w=majority`

// Configuration to use JSON data
app.use(express.json())
app.use(express.urlencoded({exteded:true}))

// Set handlebars as template motor
app.engine('handlebars', handlebars.engine({runtimeOptions: { allowProtoPropertiesByDefault: true, allowProtoMethodsByDefault: true }}))
app.set('views', __dirname + '/src/views')
app.set('view engine', 'handlebars')

app.use(session({
    store: new MongoStore({
        mongoUrl:MONGO_URL,
        mongoOptions: {useNewUrlParser: true, useUnifiedTopology: true},
        ttl: 400
    }),
    secret: 'SuperS3cretStash',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: false }
}))

initializePassport();
app.use(passport.initialize());
app.use(passport.session());

// Set the static file location
app.use('/static', express.static(__dirname + '/src/public'))

app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/sessions', sessionRouter);
app.use('/realtimeproducts', viewRouter);
app.use('/users', userRouter);
app.use('/github', gitHubLoginViewRouter)

const connectMongoDB = async () => {
    try {
        await mongoose.connect(MONGO_URL)
    } catch (error) {
        console.error("No se pudo conectar a la BD usando Moongose: " + error);
        process.exit();
    }
}
connectMongoDB();

const manager = new ProductService();
const cartManager = new CartService();

let products = await manager.getProducts();

app.get('/products', async (req, res) => {   
    let products = await manager.getProducts(req.query);

    res.render('products', { 
        products: products.docs,
        user: req.session.user,
        title: 'Productos',
        prev: products.prevLink,
        next: products.nextLink
    })
})

app.get('/cart', async (req, res) => {
    // const cart = await cartManager.getCart(id)
    res.render('cart', { 
        title: 'Carrito',
        // cart: cart.data
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