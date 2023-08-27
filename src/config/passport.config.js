import passport from "passport";
import jwtStrategy from 'passport-jwt';
import GitHubStrategy from 'passport-github2';
import { JWT_PRIVATE_KEY } from '../utils.js'
import { cManager, uManager } from '../services/factory.js'
import logger from "./logger.js";

const JwtStrategy = jwtStrategy.Strategy;
const ExtractJWT = jwtStrategy.ExtractJwt;

const initializePassport = () => {
    passport.use('jwt', new JwtStrategy(
        {
            jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
            secretOrKey: JWT_PRIVATE_KEY
        },
        async (jwt_payload, done) => {
            logger.info('Entrando a passport con JWT');
            try {
                logger.info('JWT obtenido del payload');
                logger.info(jwt_payload);
                return done(null, jwt_payload.user)
            } catch (error) {
                logger.error(error);
                done(error)
            }
        }
    ))

    // estrategie Github
    passport.use('github', new GitHubStrategy({
        clientID: 'Iv1.3e3b3db2cda611ff',
        clientSecret: '292f37c4728ba6e74c8a6b47779435625deb8a57',
        callbackURL: 'https://ecommercebackend-production-29cb.up.railway.app/api/jwt/githubcallback'
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await uManager.getByEmail(profile._json.email)

            if (!user) {
                const cart = await cManager.addCart();

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

                let result = await uManager.create(newUser)

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
            let user = await uManager.getById(id)
            done(null, user)
        } catch (err) {
            console.error("Error deserializando el usuario: " + err);
        }
    })
}

const cookieExtractor = req => {
    let token = null;
    logger.info('Entrando al cookie extractor');

    req && req.cookies && (token = req.cookies['jwtCookieToken'])

    return token;
}

export default initializePassport;