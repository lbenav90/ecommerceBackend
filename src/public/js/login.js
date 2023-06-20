const form = document.querySelector('#login-form');

form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);

    const obj = {};
    data.forEach((value, key) => obj[key] = value);

    fetch('/api/jwt/login', {
        method: 'POST',
        body: JSON.stringify(obj),
        headers: {
            'Content-Type':'application/json'
        }
    }).then(result => {
        if(result.status === 201){
            result.json()
            .then(json => {
                window.location.replace('/users/current');
            })
        } else if(result.status === 400){
            alert("Login invalido!!")
            document.querySelector('#password-field').value = "";
            document.querySelector('#password-field').focus();
        } 
    })
})