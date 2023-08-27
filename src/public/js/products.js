const addToCart = async (event) => {
    const productCode = event.target.id.split('-')[0]
    const cart = document.querySelector('#cartId')

    if (!cart) {
        location.replace('/users/login')
    }

    let result = await axios.post(`https://ecommercebackend-production-29cb.up.railway.app/api/carts/${cart.value}/products/${productCode}`)
    let response = await result.data

    Toastify({
        text: (response.status === 'success')? 'Producto agregado' : response.msg,
        duration: 3000
    }).showToast()
}

const deleteProduct = async (event) => {
    const productCode = event.target.id.split('-')[0]

    let result = await axios.delete(`https://ecommercebackend-production-29cb.up.railway.app/api/products/${productCode}`)
    let response = await result.data
    
    Toastify({
        text: (response.status === 'success')? 'Producto borrado' : response.msg,
        duration: 3000
    }).showToast()

    window.location.replace('/products')
}

document.querySelectorAll('.add-button').forEach(button => {
    button.onclick = addToCart
})
document.querySelectorAll('.delete-button').forEach(button => {
    button.onclick = deleteProduct
})