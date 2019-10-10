const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('../../src/models/user')

const baseUserId = new mongoose.Types.ObjectId()
const baseUser = {
    _id: baseUserId,
    name: 'Gnu',
    email: 'gnu@example.com',
    password: '123QE194eu1308(U##',
    tokens: [{
        token: jwt.sign({ _id: baseUserId }, process.env.JWT_SECRET)
    }]
}

const otherUserId = new mongoose.Types.ObjectId()
const otherUser = {
    _id: otherUserId,
    name: 'Rhino',
    email: 'rhino@example.com',
    password: '121314IHWRI("#y52(¤',
    tokens: [{
        token: jwt.sign({ _id: baseUserId }, process.env.JWT_SECRET)
    }]
}

const initDB = async () => {
    await User.deleteMany()
    await new User(baseUser).save()
    await new User(otherUser).save()
    
} 

module.exports = {
    baseUser,
    baseUserId,
    initDB,
}