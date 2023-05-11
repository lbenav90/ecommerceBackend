import { Router } from "express";
import passport from "passport";
import { generateJWToken, isValidPassword } from "../../utils.js";
import userModel from "../dao/db/models/users.js";
import CartService from "../dao/db/cart.services.js";

const router = Router();
const cManager = new CartService();

// Register
router.post('/register', async (req, res) => {
    const { first_name, last_name, email, age, password, confirm } = req.body;
    try {
        const exists = await userModel.findOne({ email });

        if (exists) {
            console.log('El usuario ya existe')
            return done(null, false)
        }

        if (password !== confirm) {
            console.log('Las contraseñas no coinciden')
            return done(null, false)
        }

        const cart = await cManager.addCart();

        if (cart.status === 'error') { 
            console.log('Error del servidor creando el carrito')
            return done(null, false)
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

        return done(null, result)

    } catch (err) {
        return done('Error registrando el usuario: ' + err)
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
            maxAge: 60000,
            httpOnly: true
        })

        res.status(201).send({ status: 'success', msg: 'Login exitoso' })

    } catch (error) {
        console.error(error);
        res.status(500).send({ status: 'error', msg: 'Error interno de la aplicación' })
    }
})

router.get('fail-register', (req, res) => {
    res.status(401).send({ status: 'error', msg: 'Failed to process register' })
})

router.get('fail-login', (req, res) => {
    res.status(401).send({ status: 'error', msg: 'Failed to process login' })
})

export default router;