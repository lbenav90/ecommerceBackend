import { Router } from "express";
import { createHash, generateJWToken, isValidPassword } from '../utils.js';
import passport from "passport";
import { cManager, uManager } from "../services/factory.js";
import logger from "../config/logger.js";

const router = Router();

// Register
router.post('/register', async (req, res) => {
    const { first_name, last_name, email, age, password, confirm } = req.body;

    const exists = await uManager.getByEmail(email);

    if (exists) {
        logger.warning(`El usuario ${email} ya existe en la base de datos`)
        return res.status(400).send({ status: 'error', msg: 'El email ingresado ya existe en la base de datos' })
    }
    
    if (password !== confirm) {
        logger.warning(`Las contraseñas no coinciden para el usuario ${email}`)
        return res.status(400).send({ status: 'error', msg: 'Las contraseñas no coinciden' })
    }
    
    const cart = await cManager.addCart();

    const user = {
        first_name,
        last_name,
        email,
        age,
        password: createHash(password), 
        cart: cart.data._id,
        role: email === 'adminCoder@coder.com'? 'admin': 'user',
        loggedBy: 'login'
    }

    const result = await uManager.create(user);

    return res.status(201).send({ status:'success', msg: 'Usuario creado', user: result })
})

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await uManager.getByEmail(email);

    if (!user) {
        console.warn("User not found with username: " + email);
        return res.status(400).send({ status: 'error', msg: 'Email y/o contraseña inválido/s' })
    }

    if (!isValidPassword(user, password)) {
        console.warn("Invalid credentials with username: " + email);
        return res.status(400).send({ status: 'error', msg: 'Email y/o contraseña inválido/s' })
    }

    const tokenUser =  {
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        age: user.age,
        cart: user.cart,
        role: user.role
    }

    const access_token = generateJWToken(tokenUser);
    logger.info(`JWT token generated for user: ${tokenUser}`);
    
    // Cookie setup
    res.cookie('jwtCookieToken', access_token, {
        maxAge: 600000,
        httpOnly: true
    })
    
    res.status(201).send({ status: 'success', msg: 'Login exitoso' })
})

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }), async (req, res) => {})


router.get('/githubcallback', passport.authenticate('github', { failureRedirect: '/error' }), async (req, res) => {
    const user = req.user
    
    const tokenUser =  {
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        age: user.age,
        cart: user.cart,
        role: user.role
    }
    
    const access_token = generateJWToken(tokenUser);
    logger.info(`JWT token generated for user: ${tokenUser}`);
    
    // Cookie setup
    res.cookie('jwtCookieToken', access_token, {
        maxAge: 600000,
        httpOnly: true
    })
    res.redirect('/users/current')
})

router.get('/error', (req, res) =>{
    res.render('error', { error: 'No se pudo autenticar usando Github!' })
})

export default router;