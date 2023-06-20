const addToCart = async (event) => {
    const productCode = event.target.id.split('-')[0]
    const cart = document.querySelector('#cartId')

    if (!cart) {
        location.replace('/users/login')
    }

    let result = await axios.post(`http://localhost:8080/api/carts/${cart.value}/products/${productCode}`)
    let response = await result.data

    Toastify({
        text: (response.status === 'success')? 'Producto agregado' : 'Hubo un error',
        duration: 3000
    }).showToast()
}

document.querySelectorAll('.product-data button').forEach(button => {
    button.onclick = addToCart
})