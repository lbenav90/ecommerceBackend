export default class UserDTO {
    constructor(user) {
        this.id = user._id
        this.name = `${user.first_name} ${user.last_name}`
        this.email = user.email
        this.role = user.role
        this.last_connection = user.last_connection
    }

    get = () => {
        return {
            id: this.id,
            name: this.name,
            email:this.email,
            role: this.role,
            last_connection: this.last_connection
        }
    }
}