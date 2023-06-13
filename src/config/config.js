import dotenv from 'dotenv';
import program from '../process.js';

const environment = program.opts().mode;

dotenv.config(
    {
        path: environment === "production" ? "./src/config/.env.production" : "./src/config/.env.developer"
    }
)

export default {
    mongoUrl: process.env.MONGO_URL,
    cookieSecret: process.env.COOKIE_SECRET,
    JWTPrivateKey: process.env.JWT_PRIVATE_KEY,
    sessionSecret: process.env.SESSION_SECRET
};