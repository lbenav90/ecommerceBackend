import express from 'express';
import handlebars from 'express-handlebars';
import __dirname from './utils.js';
import viewsRouter from './src/routes/views.routes.js'
import productRoutes from './src/routes/products.routes.js';
import cartRoutes from './src/routes/cart.routes.js';
import userViewsRouter from './src/routes/user.views.routes.js';  
import gitHubLoginViewRouter from './src/routes/github-login.routes.js'
import userRouter from './src/routes/user.routes.js'
import jwtRouter from './src/routes/jwt.routes.js';
import mongoose from 'mongoose';
import passport from 'passport';
import initializePassport from './src/config/passport.config.js';
import cookieParser from 'cookie-parser';

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

// Cookies
app.use(cookieParser('CoderHouseBackendBenavides'))

// Passport setup
initializePassport();
app.use(passport.initialize());

// Set the static file location
app.use('/static', express.static(__dirname + '/src/public'))

// Routers
app.use('/', viewsRouter)
app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/users', userRouter);
app.use('/api/jwt', jwtRouter);
app.use('/github', gitHubLoginViewRouter);
app.use('/users', userViewsRouter);

app.listen(PORT, () => {
    console.log(`Server live, listining on port ${PORT}`);
})

const connectMongoDB = async () => {
    try {
        await mongoose.connect(MONGO_URL)
    } catch (error) {
        console.error("No se pudo conectar a la BD usando Moongose: " + error);
        process.exit();
    }
}
connectMongoDB();