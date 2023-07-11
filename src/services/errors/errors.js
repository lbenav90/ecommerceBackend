const EErrors = {
    MONGODB_ERROR: 1, // Error en la búsqueda de datos de MongoDB
    INCOMPLETE_PARAMETERS: 2,  
    INVALID_PRODUCT: 3, // Intenta agregar o actualizar un producto que no existe en la base de datos
    INVALID_PRODUCT_IN_CART: 4, // Intento modificar un producto en el carrito que no está en el carrito
    FILESYSTEM_ERROR: 5,
    INVALID_PRODUCT_INFORMATION: 6,
    INVALID_ID: 7, // Ingreso de un ID invalido
    INVALID_UPDATE: 8, // Intenta cambiar un atributo no permitido (id)
    AUTH_ERROR: 9,
    EMPTY_CART_ERROR: 10,
    INVALID_USER: 11
}

export default EErrors;