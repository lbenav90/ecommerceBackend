import { Router } from "express";
import { createHash, generateJWToken, isValidPassword } from "../../utils.js";
import passport from "passport";
import userModel from "../dao/db/models/users.js";
import CartService from "../dao/db/cart.services.js";

const router = Router();
const cManager = new CartService()

// Register
router.post('/register', async (req, res) => {
    const { first_name, last_name, email, age, password, confirm } = req.body;
    try {
        const exists = await userModel.findOne({ email });

        if (exists) {
            console.log('El usuario ya existe')
            return res.status(401).send({ status:'error', msg: 'Credenciales inválidas' })
        }
        
        if (password !== confirm) {
            console.log('Las contraseñas no coinciden')
            return res.status(401).send({ status:'error', msg: 'Credenciales inválidas' })
        }
        
        const cart = await cManager.addCart();
        
        if (cart.status === 'error') { 
            console.log('Error del servidor creando el carrito')
            return res.status(500).send({ status:'error', msg: 'Error del servidor creando el carrito, reintente' })
        }

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

        const result = await userModel.create(user);

        return res.status(201).send({ status:'success', msg: 'Usuario creado', user: result })

    } catch (err) {
        return res.status(500).send({ status:'error', msg: 'Error del servidor creando el usuario, reintente' })
    }
})

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userModel.findOne({ email: email })
        console.log('Usuario encontrado: \n' + user);

        if (!user) {
            console.warn("User not found with username: " + email);
            res.status(204).send({ status: 'error', msg: 'Usuario no encontrado con username:' + email })
        }
        
        if (!isValidPassword(user, password)) {
            console.warn("Invalid credentials with username: " + email);
            res.status(204).send({ status: 'error', msg: 'El usuario y la contrseña no coinciden' })
        }

        const tokenUser =  {
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            age: user.age,
            cart: user.cart,
            role: user.role
        }

        const access_token = generateJWToken(tokenUser);
        console.log(access_token);

        // Cookie setup
        res.cookie('jwtCookieToken', access_token, {
            maxAge: 600000,
            httpOnly: true
        })

        res.status(201).send({ status: 'success', msg: 'Login exitoso' })

    } catch (error) {
        console.error(error);
        res.status(500).send({ status: 'error', msg: 'Error interno de la aplicación' })
    }
})

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }), async (req, res) => {})


router.get('/githubcallback', passport.authenticate('github', { failureRedirect: '/github/error' }), async (req, res) => {
    res.status(200).send({ status: 'success', msg: 'Primer login realizado', payload: req.user })
    res.redirect('/github')
})

router.get('fail-register', (req, res) => {
    res.status(401).send({ status: 'error', msg: 'Failed to process register' })
})

export default router;