import EErrors from "./errors.js";

const generateErrorMessage = (code, details) => {
    switch (code) {
        case EErrors.MONGODB_ERROR:
            return `An error ocurred in MongoDB when trying to fetch data: ${details.error}`;
        case EErrors.INCOMPLETE_PARAMETERS:
            return `Missing parameter: Needed ${details.need} and got ${details.got}`;
        case EErrors.INVALID_PRODUCT:
            return `Invalid product: Product ${details.invalid} is non existant in the chosen persistance`
        case EErrors.INVALID_PRODUCT_IN_CART:
            return `Invalid product: Product ID ${details.invalid} is non existant in the selected cart ${details.cart}`
        case EErrors.FILESYSTEM_ERROR:
            return `An error ocurred while accesing file: file access in path ${details.filepath} failed`
        case EErrors.INVALID_PRODUCT_INFORMATION:
            return `Invalid product information: needed ${details.detail}`
        case EErrors.INVALID_ID:
            return `Invalid id given: id ${details.invalid} was not found in data`
        case EErrors.INVALID_UPDATE:
            return `Invalid update: field ${details.field} cannot be changed manually`
        case EErrors.AUTH_ERROR:
            return `Authorization fail: ${details.detail}`
        case EErrors.EMPTY_CART_ERROR:
            return `Cannot perform this action on an empty cart`
        default:
            return 'Unhandled Error'
    }
}

export default generateErrorMessage;