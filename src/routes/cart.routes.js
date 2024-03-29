import { Router } from 'express';
import { authUser, createCode } from '../utils.js';
import { cManager, pManager, tManager } from '../services/factory.js';
import TicketDTO from '../services/dto/tickets.dto.js';
import CustomError from '../services/errors/custom-error.js';
import generateErrorMessage from '../services/errors/error-messages.js';
import EErrors from '../services/errors/errors.js';

const router = Router();

router.post('/', async (req, res) => {
    const created = await cManager.addCart();

    res.status(200).send(created)
});

router.get('/:cid', async (req, res) => {
    const id = req.params.cid;

    const cart = await cManager.getCart(id);

    res.status(200).send(cart)
});

router.delete('/:cid', async (req, res) => {
    const id = req.params.cid;
    
    const del = await cManager.emptyCart(id);
    
    res.status(200).send(del)
})

router.put('/:cid', async (req, res) => {
    const id = req.params.cid;
    
    const products = req.body;
    
    const added = await cManager.updateCart(id, products);
    
    res.status(200).send(added)
})

router.post('/:cid/products/:pid', authUser, async (req, res) => {
    const cid = req.params.cid
    const pid = req.params.pid

    if (cid !== req.user.cart) {
        CustomError.createError({
            name: "Authorization error",
            cause: generateErrorMessage(EErrors.AUTH_ERROR, { detail: "Cannot add to another user's cart" }),
            message: "You are not authorized for this action",
            code: EErrors.AUTH_ERROR
        })
    }
    
    // Check if product id is valid
    const product = await pManager.getProductById(pid);

    if (product.data.owner && product.data.owner.equals(req.user._id)) {
        return res.status(200).send({ status: 'error', msg: 'No puedes agregar tu propio producto al carrito' })
    }

    const added = await cManager.addProduct(cid, pid);

    res.status(200).send(added)
});

router.put('/:cid/products/:pid', authUser, async (req, res) => {
    const cid = req.params.cid
    const pid = req.params.pid

    if (cid !== req.user.cart) {
        CustomError.createError({
            name: "Authorization error",
            cause: generateErrorMessage(EErrors.AUTH_ERROR, { detail: "Cannot add to another user's cart" }),
            message: "You are not authorized for this action",
            code: EErrors.AUTH_ERROR
        })
    }

    const { quantity } = req.body

    const upd = await cManager.updateProduct(cid, pid, quantity)
    
    res.status(200).send(upd)
});

router.delete('/:cid/products/:pid', authUser, async (req, res) => {
    const cid = req.params.cid
    const pid = req.params.pid
    
    if (cid !== req.user.cart) {
        CustomError.createError({
            name: "Authorization error",
            cause: generateErrorMessage(EErrors.AUTH_ERROR, { detail: "Cannot add to another user's cart" }),
            message: "You are not authorized for this action",
            code: EErrors.AUTH_ERROR
        })
    }

    const del = await cManager.deleteProduct(cid, pid)

    res.status(200).send(del)
})

router.post('/:cid/purchase', authUser, async (req, res) => {
    const cid = req.params.cid

    const cart = await cManager.getCart(cid)

    if (cart.data.products.length === 0) {
        CustomError.createError({
            name: "Authorization error",
            cause: generateErrorMessage(EErrors.EMPTY_CART_ERROR),
            message: 'No products in cart to purchase',
            code: EErrors.EMPTY_CART_ERROR
        })
    }

    const products = await pManager.getProducts({ limit: 10000 });
    let amount = 0;
    const valid = [];
    const invalid = [];

    for (let item of cart.data.products) {
        let product = products.docs.filter(p => p._id.equals(item.product._id))[0]

        if (item.quantity <= product.stock) {
            await pManager.updateStock(product._id, product.stock - item.quantity)
            amount += product.price * item.quantity
            valid.push(item)
        } else {
            invalid.push(item)
        }
    }

    const ticket = new TicketDTO({ code: createCode(), amount: amount, user: req.user, products: valid })
    
    const newTicket = await tManager.create(await ticket.get())
    await cManager.updateCart(cid, invalid)

    res.status(200).send({ status: 'success', invalid: invalid.map(i => i.product._id), ticket: newTicket.data.code})
})

export default router;