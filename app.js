import express from 'express';
import handlebars from 'express-handlebars';
import __dirname from './utils.js';
import viewsRouter from './src/routes/views.routes.js'
import productRoutes from './src/routes/products.routes.js';
import cartRoutes from './src/routes/cart.routes.js';
import userViewsRouter from './src/routes/user.views.routes.js';  
import userRouter from './src/routes/user.routes.js'
import jwtRouter from './src/routes/jwt.routes.js';
import mongoose from 'mongoose';
import passport from 'passport';
import initializePassport from './src/config/passport.config.js';
import cookieParser from 'cookie-parser';
import program from './process.js';
import config from './src/config/config.js'
import session from 'express-session';
import MongoSingleton from './src/config/mongodb-singleton.js';

const app = express();

// Configuration to use JSON data
app.use(express.json())
app.use(express.urlencoded({ exteded: true }))

// Set handlebars as template motor
app.engine('handlebars', handlebars.engine({runtimeOptions: { allowProtoPropertiesByDefault: true, allowProtoMethodsByDefault: true }}))
app.set('views', __dirname + '/src/views')
app.set('view engine', 'handlebars')

// Cookies
app.use(cookieParser(config.cookieSecret))

// Passport setup
initializePassport();
app.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true
}))
app.use(passport.initialize());
app.use(passport.session());

// Set the static file location
app.use('/static', express.static(__dirname + '/src/public'))

// Views Routers
app.use('/', viewsRouter)
app.use('/users', userViewsRouter);

// API Routers
app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/users', userRouter);
app.use('/api/jwt', jwtRouter);

const PORT = program.opts().p
app.listen(PORT, () => {
    console.log(`Server live, listining on port ${PORT}`);
})

const mongoInstance = async () => {
    try {
        await MongoSingleton.getInstance();
    } catch (error) {
        console.error(error);
    }
};

mongoInstance();