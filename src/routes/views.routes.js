import { Router } from "express";
import jwt from 'jsonwebtoken';
import { JWT_PRIVATE_KEY, verifyJWT } from "../../utils.js";
import program from '../../process.js';

const ProductModule = program.opts().system === 'database'? await import('../dao/db/product.services.js') : await import('../dao/filesystem/product.services.js');
const CartModule = program.opts().system === 'database'? await import('../dao/db/cart.services.js') : await import('../dao/filesystem/cart.services.js');

const CartService = CartModule.default
const ProductService = ProductModule.default

const router = Router();
const manager = ProductService.getInstance();
const cManager = CartService.getInstance();

router.get('/products', async (req, res) => {   
    let products = await manager.getProducts(req.query);
    
    verifyJWT(req)
    
    res.render('products', { 
        products: products.docs,
        user: req.user,
        title: 'Productos',
        prev: products.prevLink,
        next: products.nextLink
    })
})

router.get('/cart', authUser, async (req, res) => {
    verifyJWT(req)
    
    const cart = await cManager.getCart(req.user.cart)

    res.render('cart', { 
        title: 'Carrito',
        cart: cart.data.products,
        user: req.user
    })
})

router.get('/',  (req, res) => {
    res.render('index', {})
})

function authUser(req, res, next) {
    const userToken = req.cookies['jwtCookieToken']
    jwt.verify(userToken, JWT_PRIVATE_KEY, (error, credentials) => {
        if (error) {
            const encoded = encodeURIComponent(error)
            return res.redirect('/users/error/?error=' + encoded)
        }
        //Token OK
        req.user = credentials.user;
    });

    if (req.user && ['user', 'admin'].includes(req.user.role)) {
        return next()
    } else {
        return res.redirect('/users/login')
    }
}

router.get('/private', authUser, (req, res) => {
    res.send('Si estas viendo esto, estas autorizado')
})

export default router;