import { describe } from 'mocha';
import { pManager, uManager } from '../src/services/factory.js'
import Assert from 'assert';
import productModel from '../src/services/db/models/products.js';

const assert = Assert.strict;

describe('Testing Product Services', () => {
    before(async function () {
        const total = await pManager.getProducts({ limit: 1e8 });
        this.total = total.docs
        this.totalProducts = total.docs.length

        if (this.totalProducts > 0) {
            this.result_1 = await pManager.getProducts({ limit: 1, page: 1 });
        }
        if (this.totalProducts > 1) {
            this.result_2 = await pManager.getProducts({ limit: 1, page: 2 });
        }

        this.mockProduct = {
            title: 'Medias de cuero vegetal',
            description: 'Marca Lotto talle 0.5',
            price: 25410,
            thumbnail: 'img/medias-loto.jpg',
            code: 'rg3gwefw',
            stock: 123,
            category: 'medias',
            status: true,
            owner: '6487b5689a818b1c7b89ef9a'
          }
        
        this.user = await uManager.getById(this.mockProduct.owner)

        this.remove = []
    })

    beforeEach(function () {
        this.timeout(5000)
    })
    
    it('Debe obtener un arreglo de productos', function () {
        assert.strictEqual(Array.isArray(this.total), true)
    })
    
    it('Pruebo la paginación de productos, pidiendo uno sólo por página', function () {
        if (this.totalProducts > 0) {           
            assert.strictEqual(this.result_1.docs.length, 1);
        } else {
            console.log('Test no válido, no hay productos en la base de datos');
        }
    })

    it('Me da productos distintos al cambiar de página', function () {
        if (this.totalProducts > 1) {
            assert.notDeepStrictEqual(this.result_1.docs[0], this.result_2.docs[0])
        } else {
            console.log('Test no válido, hay un solo producto en la base de datos');
        }
    })

    it('Están presentes los links a paginas siguientes y anteriores', function () {
        if (this.totalProducts > 1) {
            assert.ok(this.result_1.nextPage)
            assert.ok(this.result_2.prevPage)
        } else {
            console.log('Test no válido, hay un solo producto en la base de datos');
        }
    })

    it('Puedo crear un producto y devuelve un objeto correcto', async function () {
        const result = await pManager.addProduct(this.mockProduct);

        assert.strictEqual(result.status, 'success');
        assert.ok(result.data._id);

        this.mockProduct._id = result.data._id

        this.remove.push(this.mockProduct._id)
    })

    it('Puedo buscar el producto por id', async function () {
        const product = await pManager.getProductById(this.mockProduct._id);

        assert.strictEqual(product.status, 'success')
    })

    it('Puedo modificar un producto y devuelve un objecto correcto', async function () {
        const result = await pManager.updateProduct(this.mockProduct._id, { title: 'Changed title'}, this.user);

        assert.strictEqual(result.status, 'success');
        assert.strictEqual(result.data.modifiedCount, 1);
    })

    it('Puedo borrar un producto y devuelve un objeto correcto', async function () {

        const result = await pManager.deleteProduct(this.mockProduct._id, this.user);

        assert.strictEqual(result.status, 'success');
        assert.ok(result.data);

        this.remove = this.remove.filter(id => id !== this.mockProduct._id)
    })

    after(function () {
        if (this.remove.length !== 0) {
            this.remove.forEach(async (id) => {
                await productModel.findByIdAndDelete(id)
            })
        }
    })
})
