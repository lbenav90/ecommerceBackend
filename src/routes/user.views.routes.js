import { Router } from "express";
import { authorization, passportCall } from "../../utils.js";

const router = Router();

router.get('/', passportCall('jwt'), authorization('user'), (req, res) => {
    res.render('profile', { user: req.user })
})

router.get('/login', (req, res) => {
    res.render("login")
})

router.get('/logout', (req, res) => {
    if (req.cookies['jwtCookieToken']) {
        res.clearCookie('jwtCookieToken')
    }
    res.redirect('/users/login')
})

router.get('/register', (req, res) => {
    res.render("register")
})

router.get('/error', (req, res) => {
    res.render('error')
})


export default router;