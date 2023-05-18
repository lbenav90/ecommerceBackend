import passport from "passport";
import jwtStrategy from 'passport-jwt';
import GitHubStrategy from 'passport-github2';
import passportLocal from 'passport-local';
import userModel from '../dao/db/models/users.js';
import { JWT_PRIVATE_KEY, createHash } from '../../utils.js'
import CartService from "../dao/db/cart.services.js";

const JwtStrategy = jwtStrategy.Strategy;
const ExtractJWT = jwtStrategy.ExtractJwt;
const localStrategy = passportLocal.Strategy;
const cManager = new CartService();

const initializePassport = () => {
    passport.use('jwt', new JwtStrategy(
        {
            jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
            secretOrKey: JWT_PRIVATE_KEY
        },
        async (jwt_payload, done) => {
            console.log('Entrando a passport con JWT');
            try {
                console.log('JWT obtenido del payload');
                console.log(jwt_payload);
                return done(null, jwt_payload.user)
            } catch (error) {
                console.error(error);
                done(error)
            }
        }
    ))

    // estrategie Github
    passport.use('github', new GitHubStrategy({
        clientID: 'Iv1.3e3b3db2cda611ff',
        clientSecret: '292f37c4728ba6e74c8a6b47779435625deb8a57',
        callbackURL: 'http://localhost:8080/api/jwt/githubcallback'
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

const cookieExtractor = req => {
    let token = null;
    console.log('Entrando al cookie extractor');

    req && req.cookies && (token = req.cookies['jwtCookieToken'])

    return token;
}

export default initializePassport;