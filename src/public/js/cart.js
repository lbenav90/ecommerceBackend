const deleteFromCart = async (event) => {
    const productCode = event.target.id.split('-')[0]
    const cartCode = document.querySelector('#cartId').value

    let result = await axios.delete(`http://localhost:8080/api/carts/${cartCode}/products/${productCode}`)
    let response = await result.data

    Toastify({
        text: (response.status === 'success')? 'Producto borrado' : 'Hubo un error',
        duration: 3000
    }).showToast()

    location.reload()
}

document.querySelectorAll('.product-data button').forEach(button => {
    button.onclick = deleteFromCart
})