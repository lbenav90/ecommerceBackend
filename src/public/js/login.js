const form = document.querySelector('#login-form');

form.addEventListener('submit', event => {
    event.preventDefault();

    const data = new FormData(form);

    const obj = {}
    data.forEach((value, key) => obj[key] = value);
    fetch('/api/sessions/login', {
        method: 'POST',
        body: JSON.stringify(obj),
        headers:  {
            'Content-Type': 'application/json'
        }
    })
    .then(result => {
        if (result.status === 200) {
            window.location.replace('/products');
        }
    })
})