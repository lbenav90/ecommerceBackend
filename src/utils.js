import { fileURLToPath } from "url";
import { dirname } from 'path';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import passport from "passport";
import config from "./config/config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function createCode() {
    return String(Number(new Date())) + Math.random().toString(36).slice(2)
}

export function checkType(product, key, productConfig) {
    const type = typeof(product[key])
    if (Number(product[key]) === product[key]) {
        // For numeric fields
        if (productConfig[key] === 'integer' && Number(product[key]) % 1 != 0) {
            return {
                status: 'error', 
                msg: `The product attribute '${key}' should be of type 'integer', not 'float'`
            };
        } else if (productConfig[key] !== 'float' && productConfig[key] !== 'integer') {
            return {
                status: 'error', 
                msg: `The product attribute '${key}' should be of type ${productConfig[key]}, not ${type}`
            };
        }

        // Not checking for float types because any numeric type works in that case
    } else {
        // For boolean and string fields
        if (type !== productConfig[key]) {
            return {
                status: 'error', 
                msg: `The product attribute '${key}' should be of type ${productConfig[key]}, not ${type}`
            };
        }
    }
    return { status: 'success' }
}

export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10))

export const isValidPassword = (user, password) => bcrypt.compareSync(password, user.password);

// JSON Web Token functions
export const JWT_PRIVATE_KEY = config.JWTPrivateKey;

export const generateJWToken = (user) => {
    return jwt.sign({ user }, JWT_PRIVATE_KEY, { expiresIn: '10m' })
}

export const passportCall = (strategy) => {
    return async (req, res, next) => {
        passport.authenticate(strategy, function (err, user, info) {
            if (err) return next(err);

            if (!user) {
                return res.status(401).send({ error: info.messages? info.messages : info.toString() })
            }

            req.user = user;
            next()
        })(req, res, next);
    }
}

export const authorization = (roles) => {
    return async (req, res, next) => {
        if (!req.user) {
            const encoded = encodeURIComponent('Unauthorized: User not found in JWT')
            return res.redirect('/users/error/?error=' + encoded)
        }
        if (!roles.includes(req.user.role)) {
            const encoded = encodeURIComponent('Forbidden: El usuario no tiene permiso son este rol')
            return res.redirect('/users/error/?error=' + encoded)
        }
        next()
    }
}

export const authUser = (req, res, next) => {
    const userToken = req.cookies['jwtCookieToken']
    jwt.verify(userToken, JWT_PRIVATE_KEY, (error, credentials) => {
        if (!error) {
            req.user = credentials.user;
        }
    });
    
    if (req.user && ['user', 'admin'].includes(req.user.role)) {
        return next()
    } else {
        return res.redirect('/users/login')
    }
}

export const loadUser = (req, res, next) => {
    const userToken = req.cookies['jwtCookieToken']
    jwt.verify(userToken, JWT_PRIVATE_KEY, (error, credentials) => {
        if (!error) {
            req.user = credentials.user;
        }
    });

    next()
}

export default __dirname;