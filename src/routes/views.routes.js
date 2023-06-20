import { Router } from "express";
import { authUser, loadUser, mockProducts } from "../utils.js";
import { cManager, pManager } from "../services/factory.js";

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

export default router;