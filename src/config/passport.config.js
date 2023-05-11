import passport from "passport";
import jwtStrategy from 'passport-jwt';
import userModel from '../dao/db/models/users.js';
import { JWT_PRIVATE_KEY } from '../../utils.js'

const JwtStrategy = jwtStrategy.Strategy;
const ExtractJWT = jwtStrategy.ExtractJwt;


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