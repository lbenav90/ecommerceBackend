const setupCartPage = async () => {
    let cartCode = sessionStorage.getItem('cartCode')

    if (!cartCode) {
        let response = await axios.post('http://localhost:8080/api/carts/')
        let responseData = await response.data
        cartCode = responseData.data._id
        sessionStorage.setItem('cartCode', cartCode)
    }

    let response = await axios.get(`http://localhost:8080/api/carts/${cartCode}`)
    let responseData = await response.data
    const cart = responseData.data.products
    
    if (cart.length === 0) {
        document.querySelector('#products').innerHTML = '<p>No hay productos agregados</p>';
        return;
    }
    
    response = await axios.get('http://localhost:8080/api/products')
    responseData = await response.data
    const products = responseData.docs
    let html = '';

    cart.forEach(product => {
        const data = products.filter(p => p._id === product._id)[0]
        html += `<li>${data.title} - ${product.quantity}</li>`
    });
    document.querySelector('#products ul').innerHTML = html
}

await setupCartPage()

