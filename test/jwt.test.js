import { describe } from 'mocha';
import Assert from 'assert';
import program from '../src/process.js';
import userModel from '../src/services/db/models/users.js';
import supertest from 'supertest';

const PORT = program.opts().p   

const assert = Assert.strict;
const requester = supertest(`http://localhost:${PORT}`)

describe('Testing Auth Services', () => {
    before(function () {
        this.mockRegister = {
            first_name: 'Lucas',
            last_name: 'Rodriguez',
            email: 'lrodriguez@gmail.com',
            age: 32,
            password: '123123',
            confirm: '123123'
        }

        this.mockLogin = {
            email: 'lrodriguez@gmail.com',
            password: '123123'
        }
    })

    beforeEach(function () {
        this.timeout(5000)
    })
    
    it('Prueba de registro de un usuario', async function () {
        const { _body } = await requester.post('/api/jwt/register').send(this.mockRegister)

        assert.ok(_body.user)
    })
    
    it('Prueba de logueo correcto y devolución de cookie', async function () {
        const result = await requester.post('/api/jwt/login').send(this.mockLogin)
        const cookieResult = result.headers['set-cookie'][0]

        assert.ok(cookieResult)

        this.cookie = { 
            name: cookieResult.split('=')[0],
            value: cookieResult.split('=')[1]
        }

        assert.ok(this.cookie.name)
        assert.strictEqual(this.cookie.name, 'jwtCookieToken')
        assert.ok(this.cookie.value)
    })

    after(async function () {
        await userModel.deleteOne({ email: this.mockRegister.email })
    })
})