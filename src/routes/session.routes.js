import { Router } from "express";
import userModel from "../dao/db/models/users.js";

const router = Router();

// Register
router.post('/register', async (req, res) => {
    const { first_name, last_name, email, age, password, confirm } = req.body;

    const exists = await userModel.findOne({ email });

    if (exists) {
        return res.status(400).send({ status: 'error', msg: 'Email ya existe en la base de datos' })
    }

    if (password !== confirm) {
        return res.status(400).send({ status: 'error', msg: 'Las contraseñas no coinciden' })
    }

    const user = {
        first_name,
        last_name,
        email,
        age,
        password, //encriptar
        role: email === 'adminCoder@coder.com'? 'admin': 'user'
    }
    
    const result = await userModel.create(user);

    res.status(201).send({ status: 'success', msg: `Usuario creado exitosamente con ID: ${result.id}` })
})

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email, password });

    if (!user) {
        return res.status(401).send({ status: 'error', msg: 'Login incorrecto' })
    }

    // Crear sesión
    req.session.user = {
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        age: user.age
    }

    res.status(200).send({ status: 'success', msg: 'Primer login realizado', payload: req.session.user })
})

export default router;