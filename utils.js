import { fileURLToPath } from "url";
import { dirname } from 'path';
import bcrypt from 'bcrypt';

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

export const isValidPassword = (user, password) => bcrypt.compareSync(password, user.password)

export default __dirname;