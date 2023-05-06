import { Router } from "express";


const router = Router();

router.get('/', async (req, res) => {
    res.render('profile', {
        user: req.session.user
    })
})

router.get('/login', (req, res) => {
    res.render("login")
})

router.get('/register', (req, res) => {
    res.render("register")
})

router.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/products')
})

export default router;