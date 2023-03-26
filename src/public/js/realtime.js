const socket = io();

socket.on('products', data => {
    const productsDiv = document.querySelector('.products');
    let html = '<ul>'

    data.forEach(product => {
        html += `<li id=${product.code}>${product.title}`
        html += `<ul class='product-info' id='${product.code}'>`

        html += `<li class='product-data id' id='${product.code}-id' hidden>${product.id}</li>`
        html += `<li class='product-data description' id='${product.code}-description'>${product.description}</li>`
        html += `<li class='product-data price' id='${product.code}-price '>$${product.price}</li>`
        html += `<li class='product-data stock' id='${product.code}-stock'>${product.stock}</li>`
        html += `<li class='product-data category' id='${product.code}-category'>Category: ${product.category}</li>`
        html += `<li class='product-data status' id='${product.code}-status'>Status: ${product.status? 'ACTIVE': 'INACTIVE'}</li>`
        html += `<li class="product-data button"><button class='delete-button' id="${product.code}-delete-button">Delete item</button></li> `
        
        html += '</ul></li><br>'
    })

    productsDiv.innerHTML = html;
    deleteButtonsFuncionality();
})

const deleteButtonsFuncionality = () => {
    const deleteButtons = document.querySelectorAll('.delete-button');
    
    deleteButtons.forEach(button => {
        const code = button.id.split('-')[0]

        const id = document.querySelector(`#${code}-id`).innerText;
    
        button.onclick = () => {
            fetch(`/api/products/${id}`,{
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(result => console.log(result))
        }
    });
}

const form = document.querySelector('#add-product-form');
const submitButton = form.querySelector('#form-submit-input');

submitButton.onclick = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const code = form.querySelector('#form-code-input').value;

    if (code[0].toLowerCase() === code[0].toUpperCase()) {
        document.querySelector('#alert-messages').innerText = 'Code must start with a letter';
        return;
    }

    const added = { 
        title: form.querySelector('#form-title-input').value,
        description: form.querySelector('#form-description-input').value,
        price: parseFloat(form.querySelector('#form-price-input').value),
        thumbnail: form.querySelector('#form-thumbnail-input').value,
        stock: parseInt(form.querySelector('#form-stock-input').value),
        category: form.querySelector('#form-category-input').value,
        code: form.querySelector('#form-code-input').value,
        status: form.querySelector('#form-status-input').checked
    }

    const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(added)
    })

    const message = await response.json();

    document.querySelector('#alert-messages').innerText = message.msg

    document.querySelector('#form-title-input').value = '';
    document.querySelector('#form-description-input').value = '';
    document.querySelector('#form-price-input').value = '';
    document.querySelector('#form-thumbnail-input').value = '';
    document.querySelector('#form-stock-input').value = '';
    document.querySelector('#form-category-input').value = '';
    document.querySelector('#form-code-input').value = '';
}