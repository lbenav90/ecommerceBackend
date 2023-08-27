const deleteFromCart = async (event) => {
    const productCode = event.target.id.split('-')[0]
    const cartCode = document.querySelector('#cartId').value

    let result = await axios.delete(`https://ecommercebackend-production-29cb.up.railway.app/api/carts/${cartCode}/products/${productCode}`)
    let response = await result.data

    Toastify({
        text: (response.status === 'success')? 'Producto borrado' : 'Hubo un error',
        duration: 1000
    }).showToast()

    setTimeout(() => {
        location.reload()
    }, 1000)
}

document.querySelectorAll('.product-data button').forEach(button => {
    button.onclick = deleteFromCart
})

document.querySelector('.purchase-button').onclick = async (event) => {
    const cid = event.target.id
    
    let result = await axios.post(`https://ecommercebackend-production-29cb.up.railway.app/api/carts/${cid}/purchase`)
    let response = await result.data

    if (response.status === 'error') {
        Toastify({
            text: 'Hubo un error',
            duration: 1500
        }).showToast()
    } else {
        Toastify({
            text: (response.invalid.length === 0)? 'Compra realizada' : 'Stock insuficiente para ciertos productos',
            duration: 1500
        }).showToast()
    }

    setTimeout(() => {
        location.replace(`/purchase?code=${response.ticket}`)
    }, 1500)
}