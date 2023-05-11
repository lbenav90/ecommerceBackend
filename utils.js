import { fileURLToPath } from "url";
import { dirname } from 'path';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import passport from "passport";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
export const JWT_PRIVATE_KEY = "CoderHouseBenavidesEcommerceBackendLeandro";

export const generateJWToken = (user) => {
    return jwt.sign({ user }, JWT_PRIVATE_KEY, { expiresIn: '60s' })
}

// export const authToken = (req, res, next) => {
//     //El JWT token se guarda en los headers de autorización.
//     const authHeader = req.headers.authorization;

//     if (!authHeader) {
//         return res.status(401).send({error: "User not authenticated or missing token."});
//     }
//     const token = authHeader.split(' ')[1]; //Se hace el split para retirar la palabra Bearer

//     //Validar token
//     jwt.verify(token, PRIVATE_KEY, (error, credentials) => {
//         if (error) return res.status(403).send({error: "Token invalid, Unauthorized!"});
//         //Token OK
//         req.user = credentials.user;
//         console.log(req.user);
//         next();
//     });
// };

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

export const authorization = (role) => {
    return async (req, res, next) => {
        if (!req.user) return res.status(401).send('Unauthorized: User not found in JWT')
        if (req.user.role !== role) {
            return res.status(403).send('Forbidden: El usuario no tiene permiso son este rol')
        }
        next()
    }
}


export default __dirname;