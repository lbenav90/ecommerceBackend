import passport from "passport";
import passportLocal from 'passport-local';
import GitHubStrategy from 'passport-github2';
import userModel from '../dao/db/models/users.js';
import { createHash, isValidPassword } from '../../utils.js';
import CartService from "../dao/db/cart.services.js";

const localStrategy = passportLocal.Strategy;
const cManager = new CartService();

const initializePassport = () => {
    // estrategie Github
    passport.use('github', new GitHubStrategy({
        clientID: 'Iv1.3e3b3db2cda611ff',
        clientSecret: '292f37c4728ba6e74c8a6b47779435625deb8a57',
        callbackURL: 'http://localhost:8080/api/sessions/githubcallback'
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await userModel.findOne({ email: profile._json.email })
            if (!user) {
                const cart = await cManager.addCart();

                if (cart.status === 'error') { 
                    return done(null, false)
                }

                let newUser = {
                    first_name: profile._json.name || '',
                    last_name: '',
                    age: null,
                    email: profile._json.email || '',
                    password: '', 
                    cart: cart.data._id,
                    role: profile._json.email === 'adminCoder@coder.com'? 'admin': 'user',
                    loggedBy: 'github'
                }

                let result = await userModel.create(newUser);
                done(null, result)
            } else {
                done(null, user)
            }
        } catch (error) {
            done(error)
        }
    }))


    // estrategia Register
    passport.use('register', new localStrategy(
        { passReqToCallback: true, usernameField: 'email' },
        async (req, username, password, done) => {
            const { first_name, last_name, email, age, confirm } = req.body;
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
        }
    ))

    // estrategia Login
    passport.use('login', new localStrategy(
        { passReqToCallback: true, usernameField: 'email' },
        async (req, username, password, done) => {
            try {
                const user = await userModel.findOne({ email: username });

                if (!user || !isValidPassword(user, password)) {
                    console.warn('Invalid credentials')
                    return done(null, false)
                }
                
                return done(null, user)

            } catch (err) {
                return done('Error realizando el login: ' + err);
            }
        }
    ))

    // Funciones de serializacion y deserializacion
    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

    passport.deserializeUser(async (id, done) => {
        try {
            let user = await userModel.findById(id);
            done(null, user)
        } catch (err) {
            console.error("Error deserializando el usuario: " + err);
        }
    })
}

export default initializePassport;