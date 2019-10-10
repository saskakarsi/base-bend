const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth')
const { sendWelcomeEmail, sendCancellationEmail } = require('../emails/account.js')
const router = new express.Router()

router.post('/users', async (req, res) => {
    const user = new User(req.body)
    // If func being waited rejects exec stops
    try {
        await user.save()
        sendWelcomeEmail(user.email, process.env.SYSTEM_EMAIL, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(
            req.body.email, req.body.password
            )
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name',
                            'email',
                            'password',
                            'age']
    const isValidOp = updates.every((update) => {
        return allowedUpdates.includes(update)
    })
    if (!isValidOp) {
        return res.status(400).send({ 
            error: 'Invalid update, key(s) not found.'
        })
    }
    try {
        updates.forEach((update) => {
            req.user[update] = req.body[update]
        })
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        if (e.name === 'ValidationError') {
            return res.status(400).send({error: "Validation error"})
        }
        res.status(400).send()
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        sendCancellationEmail(req.user.email, process.env.SYSTEM_EMAIL, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

const avatarUpload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            cb(new Error('Please upload an image.'))
        }
        cb(undefined, true)
    }
})

router.post('/users/me/avatar', 
            auth,
            avatarUpload.single('avatar'), 
            async (req, res) => {
                try {
                const buffer = await sharp(req.file.buffer)
                            .resize({ width: 300, height: 300 })
                            .png()
                            .toBuffer()
                req.user.avatar = buffer
                await req.user.save()
                res.send()
                } catch (e) {
                    res.status(400).send()
                }   
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})

module.exports = router