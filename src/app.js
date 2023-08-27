import express from 'express';
import __dirname from './utils.js';
import session from 'express-session';
import program from './process.js';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUiExpress from 'swagger-ui-express';

const PORT = program.opts().p || 8080

const app = express();

const swaggerOptions = {
    definition: {
        openapi: '3.0.1',
        info: {
            title: 'Documentación de la API Benavides',
            description: 'Descripción de las rutas disponibles en la API del ecommerce'
        }
    },
    apis: [`${__dirname}/docs/**/*.yaml`]
}

const specs = swaggerJSDoc(swaggerOptions);
app.use('/apidocs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs))

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
app.use(cookieParser(process.env.COOKIE_SECRET))

import passport from 'passport';
import initializePassport from './config/passport.config.js';
import logger, { addLogger } from './config/logger.js';

// Passport setup
initializePassport();
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(addLogger);

// Set the static file location
app.use('/static', express.static(__dirname + '/public'))

import viewsRouter from './routes/views.routes.js'
import productRoutes from './routes/products.routes.js';
import cartRoutes from './routes/cart.routes.js';
import userViewsRouter from './routes/user.views.routes.js';  
import jwtRouter from './routes/jwt.routes.js';
import userRouter from './routes/user.routes.js'

// Views Routers
app.use('/', viewsRouter)
app.use('/users', userViewsRouter);

// API Routers
app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/jwt', jwtRouter);
app.use('/api/users', userRouter)

import errorHandler from './services/errors/error-middleware.js';

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, "0.0.0.0", () => {
    logger.info(`Server live, listening on port ${PORT}`);
})