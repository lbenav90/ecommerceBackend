import { fileURLToPath } from "url";
import { dirname } from 'path';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import passport from "passport";
import config from "./config/config.js";
import { faker } from "@faker-js/faker";
import program from './process.js';
import nodemailer from 'nodemailer';

const PORT = program.opts().p

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
faker.locale = 'es';

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
    
    if (req.user && ['user', 'admin', 'premium'].includes(req.user.role)) {
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

const mocked = []

export const mockProducts = (number, page = 1) => {
    if (mocked.length == 0) {
        for (let i = 0; i < number; i++) {
            mocked.push({
                title: faker.commerce.productName(),
                _id: faker.database.mongodbObjectId(),
                description: faker.commerce.productDescription(),
                price: parseFloat(faker.commerce.price()),
                stock: parseInt(faker.random.numeric(2)),
                category: faker.commerce.department(),
                active: Math.random() >= 0.95? false: true,
                owner: faker.database.mongodbObjectId()
            })
        }
    }

    let realPage = page;

    page < 1 && (realPage = 1);
    page > Math.floor(mocked.length / 10) + 1 && (realPage = Math.floor(mocked.length / 10) + 1)

    const products = {
        status: 'success',
        docs: mocked.slice(10 * (realPage - 1), 10 * realPage),
        prevLink: page === 1? null : `http://localhost:${PORT}/mockingproducts?page=${realPage - 1}`,
        nextLink: page === Math.floor(mocked.length / 10)? null : `http://localhost:${PORT}/mockingproducts?page=${realPage + 1}`
    }
    
    return products;
}

export const sendResetEmail = async (email, link) => {
    const transport = nodemailer.createTransport({
        service: 'gmail',
        port: 587,
        auth: { 
            user: 'lnbenavides90@gmail.com',
            pass: config.gmailPass
        }
    })

    const result = await transport.sendMail({
        from: 'Ecommerce',
        to: email,
        subject: 'Reestablecer contraseña',
        html: `
        <h1>Reestablecer la contraseña para el ecommerce</h1>

        <div>
            <p>Recibimos un pedido de reestablecimiento de contraseña. Para continuar con el proceso, haga click en el siguiente link:</p>

            <a href="http://${link}">Reestablecer contraseña</a>
            <p>Si no solicitó este cambio, ignore esta comunicación</p>
        </div>
        `,
        attachments: []
    })

    return result
}

export default __dirname;