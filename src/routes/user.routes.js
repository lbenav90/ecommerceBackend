import { Router } from "express";
import __dirname, { authUser, generateJWToken, uploader } from "../utils.js";
import { uManager } from "../services/factory.js";
import logger from "../config/logger.js";
import fs from 'fs-extra';

const router = Router();

router.post('/premium/:uid', authUser, async (req, res) => {
    const identification = req.user.documents.filter(document => document.name === 'identification')[0] || undefined;
    const residence = req.user.documents.filter(document => document.name === 'residence')[0] || undefined;
    const account_status = req.user.documents.filter(document => document.name === 'account-status')[0] || undefined;

    if (!identification || !residence || !account_status && req.user.role === 'user') {
        return res.redirect('/users/error?error="Subir identificación y comprobantes de residencia y status de cuenta"')
    }

    await uManager.changeUserType(req.user._id, req.user.role);

    const tokenUser =  {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        age: req.user.age,
        cart: req.user.cart,
        role: req.user.role === 'user'? 'premium' : 'user',
        loggedBy: req.user.loggedBy,
        documents: req.user.documents,
        last_connection: req.user.last_connection
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

router.post('/:uid/documents', authUser, uploader.single('upload'), async (req, res) => {
    if (!req.file) {
        return res.redirect('/users/error?error="No file given"')
    }

    let folder;

    switch (req.body.type) {
        case 'profiles':
            folder = 'uploads\\profiles';
            break;
        case 'products':
            folder = 'uploads\\products';
            break;
        case 'identification':
        case 'residence':
        case 'account-status':
            folder = 'uploads\\documents';
            break;
    }
    
    const oldDir = `${__dirname}\\public\\uploads\\${req.file.filename}`
    const newDir = `${__dirname}\\public\\${folder}\\${req.body.type}-${req.file.filename}`

    fs.move(oldDir, newDir,(err) => {})

    req.user.documents.push({ name: req.body.type, reference: newDir })

    const access_token = generateJWToken(req.user);
    logger.info(`JWT token generated for user: ${req.user}`);

    // Cookie setup
    res.cookie('jwtCookieToken', access_token, {
        maxAge: 600000,
        httpOnly: true
    })
    
    await uManager.updateDocuments(req.user.email, req.user.documents)

    res.redirect('/users/current')
})

export default router;