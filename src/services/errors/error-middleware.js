import EErrors from "./errors.js";

const errorHandler = (error, req, res, next) => {
    console.log('Error detectado, entrando al error handler')
    console.log(error.cause);
    switch (error.code) {
        case EErrors.MONGODB_ERROR:
        case EErrors.INCOMPLETE_PARAMETERS:
        case EErrors.INVALID_PRODUCT:
        case EErrors.INVALID_PRODUCT_IN_CART:
        case EErrors.FILESYSTEM_ERROR:
        case EErrors.INVALID_PRODUCT_INFORMATION:
        case EErrors.INVALID_ID:
        case EErrors.INVALID_UPDATE:
        case EErrors.EMPTY_CART_ERROR:
            res.status(400).send({ status: 'error', msg: error.message })
            break;
        case EErrors.AUTH_ERROR:
            res.status(403).send({ status: 'error', msg: error.message })
            break;
        default:
            res.status(500).send({ status: 'error', msg: 'Unhandled error' })
            break;
    }
}

export default errorHandler;