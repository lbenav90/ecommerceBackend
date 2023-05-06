import { Router } from "express";
import passport from "passport";

const router = Router();

// Register
router.post('/register', passport.authenticate('register', { failureRedirect: '/api/sessions/fail-register' }), async (req, res) => {
    console.log('Registrando nuevo usuario');
    res.status(201).send({ status: 'success', msg: 'Usuario creado con éxito' })
})

// Login
router.post('/login', passport.authenticate('login', { failureRedirect: '/api/sessions/fail-login' }), async (req, res) => {
    const user = req.user

    req.session.user = {
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        age: user.age
    }

    res.status(201).send({ status: 'success', msg: 'Login realizado con éxito', payload: req.session.user })
})

router.get('fail-register', (req, res) => {
    res.status(401).send({ status: 'error', msg: 'Failed to process register' })
})

router.get('fail-login', (req, res) => {
    res.status(401).send({ status: 'error', msg: 'Failed to process login' })
})

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }), async (req, res) => {})

router.get('/githubcallback', passport.authenticate('github', { failureRedirect: '/github/error' }), async (req, res) => {
    const user = req.user;
    req.session.user = {
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        age: user.age
    }
    req.session.admin = true;
    res.redirect('/github')
})

export default router;