import { Router } from "express";
import { authUser, authorization, loadUser, mockProducts } from "../utils.js";
import { cManager, pManager, tManager, uManager } from "../services/factory.js";
import logger from "../config/logger.js";

const router = Router();

router.get('/products', loadUser, async (req, res) => {   
    const products = await pManager.getProducts(req.query);

    let owned;
    let newProducts = products.docs.map(p => {

        if (!req.user || !p.owner) {
            owned = false
        } else if (p.owner.equals(req.user._id)) {
            owned = true
        } else {
            owned = false
        }

        return {
            ...p._doc,
            owner: owned
        }
    })

    res.render('products', { 
        products: newProducts,
        user: req.user,
        title: 'Productos',
        prev: products.prevLink,
        next: products.nextLink
    })
})

router.get('/mockingproducts', loadUser, (req, res) => {
    const { page } = req.query

    const products = mockProducts(100, page && parseInt(page));

    let owned;
    let newProducts = products.docs.map(p => {
        if (!req.user) {
            owned = false
        } else if (p.owner.equals(req.user._id)) {
            owned = true
        } else {
            owned = false
        }
        
        return {
            ...p._doc,
            owner: owned
        }
    })

    res.render('products', {
        products: newProducts,
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
    res.redirect('/products')
})

router.get('/purchase', async (req, res) => {
    const ticketCode = req.query.code;
    const ticket = await tManager.getById(ticketCode)
    console.log(ticket.data[0].products);

    res.render('purchase', {
        amount: ticket.data[0].amount,
        products: ticket.data[0].products
    })
})

router.get('/admin', authUser, authorization(['admin']), async (req, res) => {
    const users = await uManager.getAll();
    res.render('admin', {
        users: users.map(user => { return { ...user, admin: user.role === 'admin' }})
    })
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