import { Router } from "express";
import { authorization, passportCall } from "../utils.js";

const router = Router();

router.get('/current', passportCall('jwt'), authorization(['user', 'admin']), (req, res) => {
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
    const { error } = req.query
    res.render('error', {
        error: error
    })
})


export default router;