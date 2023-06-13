import { Router } from "express";
import { authUser, loadUser } from "../utils.js";
import { cManager, pManager } from "../services/factory.js";

const router = Router();

router.get('/products', loadUser, async (req, res) => {   
    const products = await pManager.getProducts(req.query);
    
    console.log(req.user);

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