import { Router } from 'express';
import { authUser, createCode } from '../utils.js';
import { cManager, pManager, tManager } from '../services/factory.js';
import TicketDTO from '../services/dto/tickets.dto.js';

const router = Router();

router.post('/', async (req, res) => {
    const created = await cManager.addCart();

    const code = created.status === 'success'? 200 : 400;

    res.status(code).send({ code: code, ...created })
});

router.get('/:cid', async (req, res) => {
    const id = req.params.cid;

    const cart = await cManager.getCart(id);

    const code = cart.status === 'success'? 200: 400;
    
    res.status(code).send({ code: code, ...cart })
});

router.delete('/:cid', async (req, res) => {
    const id = req.params.cid;
    
    const del = await cManager.emptyCart(id);
    
    const code = del.status === 'success'? 200: 400;
    
    res.status(code).send({ code: code, ...del })
})

router.put('/:cid', async (req, res) => {
    const id = req.params.cid;
    
    const products = req.body;
    
    const added = await cManager.updateCart(id, products);
    
    const code = added.status === 'success'? 200: 400;
    
    res.status(code).send({ code: code, ...added })
})

router.post('/:cid/products/:pid', authUser, async (req, res) => {
    const cid = req.params.cid
    const pid = req.params.pid

    if (cid !== req.user.cart) {
        res.status(404).send({ status: 'error', msg: "Cannot add to another user's cart"})
        return;
    }
    
    const product = await pManager.getProductById(pid);

    if (product.status === 'error') {
        // Check if the product id given exists in the list of products
        res.status(400).send({ code: 400, ...product })
        return;
    }

    const added = await cManager.addProduct(cid, pid);

    const code =  added.status === 'success'? 200: 400;

    res.status(code).send({ code: code, ...added })
});

router.put('/:cid/products/:pid', authUser, async (req, res) => {
    const cid = req.params.cid
    const pid = req.params.pid

    if (cid !== req.user.cart) {
        res.status(404).send({ status: 'error', msg: "Cannot add to another user's cart"})
        return;
    }

    const { quantity } = req.body

    const upd = await cManager.updateProduct(cid, pid, quantity)
    
    const code = upd.status === 'success'? 200: 400;
    
    res.status(code).send({ code: code, ...upd })
});

router.delete('/:cid/products/:pid', authUser, async (req, res) => {
    const cid = req.params.cid
    const pid = req.params.pid
    
    if (cid !== req.user.cart) {
        res.status(404).send({ status: 'error', msg: "Cannot add to another user's cart"})
        return;
    }

    const del = await cManager.deleteProduct(cid, pid)

    const code = del.status === 'success'? 200: 400;

    res.status(code).send({ code: code, ...del })
})

router.post('/:cid/purchase', authUser, async (req, res) => {
    const cid = req.params.cid

    const cart = await cManager.getCart(cid)
    if (cart.status === 'error') {
        return res.status(404).send({ status: 'error', msg: 'No cart found for the given ID' })
    }

    if (cart.data.products.length === 0) {
        return res.status(403).send({ status: 'error', msg: 'No products to purchase' })
    }

    const products = await pManager.getProducts({ limit: 10000 });
    let product, result;
    let amount = 0;
    const invalid = [];

    cart.data.products.forEach(async (item) => {
        product = products.docs.filter(p => p._id.equals(item.product._id))[0]

        if (item.quantity <= product.stock) {
            result = await pManager.updateProduct(product._id, { stock: product.stock - item.quantity })
            amount += product.price * item.quantity
        } else {
            invalid.push(item)
        }
    })

    const ticket = new TicketDTO({ code: createCode(), amount: amount, user: req.user })
    const ticketCreated = await tManager.create(await ticket.get())

    if (ticketCreated === 'error') {
        return res.status(400).send({ status: 'error', msg: 'Something went wrong creating ticket' })
    }

    const cartUpdated = await cManager.updateCart(cid, invalid)

    if (cartUpdated === 'error') {
        return res.status(400).send({ status: 'error', msg: 'Something went wrong updating cart' }) 
    }

    res.status(200).send({ status: 'success', invalid: invalid.map(i => i.product._id) })
})

export default router;