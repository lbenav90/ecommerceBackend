import { Router } from "express";
import { authorization, createHash, isValidPassword, passportCall, sendResetEmail } from "../utils.js";
import { pManager, tkManager, uManager } from '../services/factory.js';
import EErrors from "../services/errors/errors.js";
import CustomError from "../services/errors/custom-error.js";
import generateErrorMessage from "../services/errors/error-messages.js";
import program from "../process.js";
import bcrypt from 'bcrypt';

const PORT = program.opts().p

const router = Router();

router.get('/current', passportCall('jwt'), authorization(['user', 'admin', 'premium']), (req, res) => {
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

router.get('/recovery', (req, res) => {
    const expired = req.query.expired;

    res.render("recovery", { expired: expired })
})

router.post('/recovery', async (req, res) => {
    const user = await uManager.getByEmail(req.body.email);

    if (!user) {
        CustomError.createError({
            name: "Invalid user",
            cause: generateErrorMessage(EErrors.INVALID_USER, { email: req.body.email }),
            message: "User does not exist",
            code: EErrors.INVALID_USER
        })
    }

    const newToken = await tkManager.create(req.body.email)
    const resetToken = newToken.data.token

    const link = `localhost:${PORT}/users/passwordReset?token=${resetToken}&email=${req.body.email}`;
    sendResetEmail(req.body.email, link)

    res.render('recovery', {
        requested: true
    })
})

router.get('/passwordReset', async (req, res) => {
    res.render('password-reset', req.query)
})

router.post('/passwordReset', async (req, res) => {
    const { email, token, password } = req.body

    const validToken = await tkManager.find(email)

    if (!validToken) {
        return res.redirect('/users/recovery?expired=true')
    }

    if (!bcrypt.compareSync(token, validToken.token)) {
        CustomError.createError({
            name: "Invalid password recovery token",
            cause: generateErrorMessage(EErrors.INVALID_RECOVERY_TOKEN),
            message: "Token does not match database",
            code: EErrors.INVALID_RECOVERY_TOKEN
        })
    }

    const user = await uManager.getByEmail(email);

    if (isValidPassword(user, password)){
        return res.render('password-reset', {
            token: token,
            email: email,
            error: 'La nueva contraseña no puede ser igual a la anterior'
        })
    }

    await uManager.resetPassword(email, createHash(password))

    res.redirect('/users/login')
})

router.get('/create', (req, res) => {
    res.render('product-upload', {
        title: 'Agregar un producto',
        action: '/api/products'
    })
})

router.get('/update', async (req, res) => {
    const { id } = req.query
    const product = await pManager.getProductById(id);

    res.render('product-upload', {
        title: 'Modificar un producto',
        product: product.data,
        update: true,
        action: `/api/products/${id}`
    })
})

router.get('/error', (req, res) => {
    const { error } = req.query
    res.render('error', {
        error: error
    })
})



export default router;