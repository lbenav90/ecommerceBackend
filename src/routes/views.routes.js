import { Router } from "express";
import ProductService from "../dao/db/product.services.js";
import jwt from 'jsonwebtoken';
import { JWT_PRIVATE_KEY } from "../../utils.js";
import CartService from "../dao/db/cart.services.js";

const router = Router();
const manager = new ProductService();
const cManager = new CartService();

router.get('/products', async (req, res) => {   
    let products = await manager.getProducts(req.query);
    const userToken = req.cookies['jwtCookieToken']
    jwt.verify(userToken, JWT_PRIVATE_KEY, (error, credentials) => {
        if (error) return;
        req.user = credentials.user;
    });

    res.render('products', { 
        products: products.docs,
        user: req.user,
        title: 'Productos',
        prev: products.prevLink,
        next: products.nextLink
    })
})

router.get('/cart', authUser, async (req, res) => {
    const cart = await cManager.getCart(req.user.cart)
    console.log(cart.data.products);
    res.render('cart', { 
        title: 'Carrito',
        cart: cart.data.products
    })
})

router.get('/',  (req, res) => {
    res.render('index', {})
})

function authUser(req, res, next) {
    const userToken = req.cookies['jwtCookieToken']
    jwt.verify(userToken, JWT_PRIVATE_KEY, (error, credentials) => {
        if (error) return res.status(403).send({error: "Token invalid, Unauthorized!"});
        //Token OK
        req.user = credentials.user;
    });

    if (req.user && req.user.role === 'user') {
        return next()
    } else {
        return res.redirect('/users/login')
    }
}

router.get('/private', authUser, (req, res) => {
    res.send('Si estas viendo esto, estas autorizado')
})

export default router;