const request = require('supertest')
const jwt = require('jsonwebtoken')
const app = require ('../src/app')
const User = require('../src/models/user')
const { baseUser, baseUserId, initDB } = require('./fixtures/db')

beforeEach(initDB)

// 
const newUsers = [
    { 
        'user': {
            name: 'Giraffe',
            email: 'giraffe@example.com',
            password: 'ExamplePass!2344'
        },
        'expectation': 201
    }, {
        'user': {
            name: 'Lion',
            email: 'lion@lion', // should fail
            password: 'EEfiej)#)9993JIDFJss'
        },
        'expectation': 400
    }, {
        'user': {
            name: 'Zebra',
            email: 'zebra@example.com',
            password: 'password' // should fail
        },
        'expectation': 400
    }, { 
        'user': {
            name: 'Giraffe',
            email: 'giraffe@example.com', // should fail (already exists)
            password: 'ExamplePass!2344'
        },
        'expectation': 400
    },
]

test('New user signup', async () => {
    for ({ user, expectation } of newUsers) {
        const res = await request(app)
            .post('/users')
            .send(user)
            .expect(expectation)
        
        if (res.status === 201) {
            // If user was created assert database updated
            const newUser = await User.findById(res.body.user._id)
            expect(newUser).not.toBeNull()
            // Check response body form
            expect(res.body).toMatchObject({
                user: {
                    name: user.name,
                    email: user.email,
                },
                token: newUser.tokens[0].token
            })
            /* 
                Check plaintext password is not returned.
                Verified in response body check above as
                well but that's definitely something I'd 
                delete and forget to check this
            */
            expect(newUser.password).not.toBe(user.password)
        }

    }
})

test('Existing user login', async () => {
    const res = await request(app).post('/users/login').send({
        email: baseUser.email,
        password: baseUser.password
    }).expect(200)

    const newUser = await User.findById(res.body.user._id)
    // Check new token was created
    expect(newUser.tokens.length).toBe(baseUser.tokens.length + 1)
    // Check returned token is the same as saved one
    expect(newUser.tokens.slice(-1)[0].token).toBe(res.body.token)
    
})

test('Nonexisting user login', async () => {
    await request(app).post('/users/login').send({
        email: 'nonexistantemail@example.com',
        password: 'UseRdoESnoTexiST'
    }).expect(400)
})

test('Existing user login wrong password', async () => {
    await request(app).post('/users/login').send({
        email: baseUser.email,
        password: 'Wrong password',
    }).expect(400)
})

test('Get profile for existing user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${baseUser.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Fail getting profile for existing user with bad token', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${jwt.sign({ _id: baseUserId }, "NotTheCorrectSecret")}`)
        .send()
        .expect(401)
})

test('Fail getting profile for existing user with no token', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Delete existing user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${baseUser.tokens[0].token}`)
        .send()
        .expect(200)

    const user = await User.findById(baseUserId)
    // Check user has disappeared
    expect(user).toBeNull()
})

test('Update existing user', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${baseUser.tokens[0].token}`)
        .send({ email: 'mongoose@example.com' })
        .expect(200)

    const user = await User.findById(baseUserId)
    expect(user.email).toBe('mongoose@example.com')
})

test('Fail updating existing user with invalid fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${baseUser.tokens[0].token}`)
        .send({ thisIsAnInvalidField: 'ShouldFail' })
        .expect(400)
})

test('Fail updating existing user with invalid email', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${baseUser.tokens[0].token}`)
        .send({ email: 'notavalidemail@invalid' })
        .expect(400)
})

test('Fail deleting existing user with bad token', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${jwt.sign({ _id: baseUserId}, "NotTheCorrectSecret")}`)
        .send()
        .expect(401)
})

test('Fail deleting existing user with no token', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${baseUser.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/avatar.png')
        .expect(200)

    const user = await User.findById(baseUserId)
    // Check an avatar was saved
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Fail uploading avatar image with no auth', async () => {
    await request(app)
        .post('/users/me/avatar')
        .attach('avatar', 'tests/fixtures/avatar.png')
        .expect(401)
})
