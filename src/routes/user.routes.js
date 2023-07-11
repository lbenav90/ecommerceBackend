import { Router } from "express";
import { authUser, generateJWToken } from "../utils.js";
import { uManager } from "../services/factory.js";
import logger from "../config/logger.js";

const router = Router();

router.post('/premium/:uid', authUser, async (req, res) => {
    await uManager.changeUserType(req.user._id, req.user.role);
    const tokenUser =  {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        age: req.user.age,
        cart: req.user.cart,
        role: req.user.role === 'user'? 'premium' : 'user'
    }

    const access_token = generateJWToken(tokenUser);
    logger.info(`JWT token generated for user: ${tokenUser}`);

    // Cookie setup
    res.cookie('jwtCookieToken', access_token, {
        maxAge: 600000,
        httpOnly: true
    })

    res.redirect('/users/current')
})

export default router;