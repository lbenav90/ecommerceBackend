import { describe } from 'mocha';
import { cManager, pManager } from '../src/services/factory.js'
import Assert from 'assert';
import cartModel from '../src/services/db/models/carts.js';
import { threadId } from 'worker_threads';

const assert = Assert.strict;

describe('Testing Cart Services', () => {
    before(async function () {
        this.total = await cManager.getAll()
        const product = await pManager.getProducts({ limit: 1, page: 1 });

        this.product = product.docs[0]
        this.remove = []
    })

    beforeEach(function () {
        this.timeout(5000)
    })
    
    it('Debe obtener un arreglo de carritos', function () {
        assert.strictEqual(this.total.status, 'success')
        assert.strictEqual(Array.isArray(this.total.data), true)
    })
    
    it('Pruebo crear un carrito', async function () {
        const cart = await cManager.addCart();
        
        assert.strictEqual(cart.status, 'success')
        assert.strictEqual(Array.isArray(cart.data.products), true)
        assert.strictEqual(cart.data.products.length, 0)

        this.cartId = cart.data._id
        this.remove.push(this.cartId)
    })

    it('Pruebo añadir un producto al carrito', async function () {
        const add = await cManager.addProduct(this.cartId, this.product._id)

        assert.strictEqual(add.status, 'success')
    })

    it('Pruebo obtener el nuevo carrito con el producto agregado', async function () {
        const cart = await cManager.getCart(this.cartId);

        assert.strictEqual(cart.status, 'success')

        this.cart = cart.data.products

        assert.strictEqual(Array.isArray(this.cart), true)
    })

    it('Chequeo que el producto agregado al carrito sea el correcto', async function () {
        assert.strictEqual(this.cart.length, 1)
        assert.strictEqual(this.cart[0]._id.equals(this.product._id), true)
        assert.strictEqual(this.cart[0].quantity, 1)
    })

    it('Chequear modificando el carrito manualmente', async function () {
        const upd = await cManager.updateCart(this.cartId, [{ _id: this.product._id, product: this.product, quantity: 2 }])

        assert.strictEqual(upd.status, 'success')
        
        const cart = await cManager.getCart(this.cartId);
        
        assert.strictEqual(cart.data.products[0].quantity, 2)
    })

    it('Puedo borrar un producto de un carrito', async function () {
        const del = await cManager.deleteProduct(this.cartId, this.product._id)

        assert.strictEqual(del.status, 'success')

        const cart = await cManager.getCart(this.cartId);
        
        assert.strictEqual(cart.data.products.length, 0)
    })

    after(async function () {
        if (this.remove.length !== 0) {
            await cartModel.deleteMany({ _id: { $in: this.remove } })
        }
    })
})