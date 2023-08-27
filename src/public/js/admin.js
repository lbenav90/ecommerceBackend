const deleteButtons = document.querySelectorAll('.delete-button');

deleteButtons.forEach(button => {
    button.onclick = async () => {
        const id = button.classList[0];
        
        let result = await axios.delete(`http://localhost:8080/api/users/${id}`)
        let response = await result.data

        Toastify({
            text: (response.status === 'success')? 'Usuario borrado' : response.msg,
            duration: 1500
        }).showToast()
    
        setTimeout(() => {
            location.reload()
        }, 1500)
    }
})

const changeButtons = document.querySelectorAll('.change-role-button');

changeButtons.forEach(button => {
    button.onclick = async () => {
        const id = button.classList[0];
        const role = document.getElementById(`${id}-role`).dataset.role;

        let result = await axios.post(`http://localhost:8080/api/users/${id}?role=${role}`)
        let response = await result.data

        Toastify({
            text: (response.status === 'success')? 'Usuario modificado' : response.msg,
            duration: 1500
        }).showToast()
    
        setTimeout(() => {
            location.reload()
        }, 1500)
    }
})

document.querySelector('#delete-inactive-accounts').onclick = async () => {
        let result = await axios.delete(`http://localhost:8080/api/users/`)
        let response = await result.data

        Toastify({
            text: (response.status === 'success')? 'Usuarios inactivos borrados' : response.msg,
            duration: 1500
        }).showToast()
    
        setTimeout(() => {
            location.reload()
        }, 1500)
}