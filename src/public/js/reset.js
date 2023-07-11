const form = document.querySelector('#reset-password-form');

form.onsubmit = (event) => {
    const password = document.querySelector("#password-field").value
    const confirm = document.querySelector("#confirm-field").value

    if (password !== confirm) {
        event.preventDefault()
        
        let alert = document.querySelector('#alert-password-match');
        alert && alert.remove();

        alert = document.createElement('p')
        alert.id = 'alert-password-match'
        alert.style.color = 'red';
        alert.innerText = 'Las contraseñas no coinciden'
    
        document.body.append(alert)
    } 
}