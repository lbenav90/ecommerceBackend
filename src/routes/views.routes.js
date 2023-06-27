import { Router } from "express";
import { authUser, loadUser, mockProducts } from "../utils.js";
import { cManager, pManager } from "../services/factory.js";
import logger from "../config/logger.js";

const router = Router();

router.get('/products', loadUser, async (req, res) => {   
    const products = await pManager.getProducts(req.query);

    res.render('products', { 
        products: products.docs,
        user: req.user,
        title: 'Productos',
        prev: products.prevLink,
        next: products.nextLink
    })
})

router.get('/mockingproducts', loadUser, (req, res) => {
    const { page } = req.query

    const products = mockProducts(100, page && parseInt(page));

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

    res.render('cart', { 
        title: 'Carrito',
        cart: cart.data.products,
        user: req.user
    })
})

router.get('/',  (req, res) => {
    res.render('index', {})
})

router.get('/private', authUser, (req, res) => {
    res.send('Si estas viendo esto, estas autorizado')
})

router.get('/loggerTest', (req, res) => {
    logger.debug('Debug logger test')
    logger.info('Info logger test')
    logger.warning('Warning test')
    logger.error('Error logger test')
    logger.fatal('Fatal logger test')

    res.redirect('/')
})

export default router;