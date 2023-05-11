import { Router } from "express";
import ProductService from "../dao/db/product.services.js";
import cookieParser from "cookie-parser";

const router = Router();
const manager = new ProductService();

router.get('/products', async (req, res) => {   
    let products = await manager.getProducts(req.query);

    res.render('products', { 
        products: products.docs,
        user: req.session.user,
        title: 'Productos',
        prev: products.prevLink,
        next: products.nextLink
    })
})

router.get('/cart', async (req, res) => {
    // const cart = await cartManager.getCart(id)
    res.render('cart', { 
        title: 'Carrito',
        // cart: cart.data
    })
})

router.get('/',  (req, res) => {
    res.render('index', {})
})


router.get('/logout', (req, res) => {
    req.session.destroy(error => {
        if (error) {
            res.json({ error: 'logout error', msg: 'Error al cerrar la sesión'})
        }
    })
    res.redirect('/products')
})

function auth(req, res, next) {
    if (req.session.user && req.session.admin) {
        return next()
    } else {
        return res.status(403).send('Usuario no autorizado para ingresar a este recurso')
    }
}

router.get('private', auth, (req, res) => {
    res.send('Si estas viendo esto, estas autorizado')
})

export default router;