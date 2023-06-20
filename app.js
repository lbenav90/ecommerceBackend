import express from 'express';
import __dirname from './src/utils.js';

import config from './src/config/config.js';
import session from 'express-session';

const app = express();

// Configuration to use JSON data
app.use(express.json())
app.use(express.urlencoded({ exteded: true }))

import handlebars from 'express-handlebars';

// Set handlebars as template motor
app.engine('handlebars', handlebars.engine({runtimeOptions: { allowProtoPropertiesByDefault: true, allowProtoMethodsByDefault: true }}))
app.set('views', __dirname + '/views')
app.set('view engine', 'handlebars')

import cookieParser from 'cookie-parser';
// Cookies
app.use(cookieParser(config.cookieSecret))

import passport from 'passport';
import initializePassport from './src/config/passport.config.js';

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
app.use('/static', express.static(__dirname + '/public'))

import viewsRouter from './src/routes/views.routes.js'
import productRoutes from './src/routes/products.routes.js';
import cartRoutes from './src/routes/cart.routes.js';
import userViewsRouter from './src/routes/user.views.routes.js';  
import jwtRouter from './src/routes/jwt.routes.js';

// Views Routers
app.use('/', viewsRouter)
app.use('/users', userViewsRouter);

// API Routers
app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/jwt', jwtRouter);

import errorHandler from './src/services/errors/error-middleware.js';

// Error handling middleware
app.use(errorHandler);

import program from './src/process.js';

const PORT = program.opts().p

app.listen(PORT, () => {
    console.log(`Server live, listining on port ${PORT}`);
})