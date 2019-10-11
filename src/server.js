const http = require('http')
const express = require('express')
const socketio = require('socket.io')
require('./db/mongoose')
const userRouter = require('./routers/user')

const app = express()

app.use(express.json())
app.use(userRouter)

const server = http.createServer(app)
const io = socketio(server)

io.on('connect', (socket) => {

    socket.on('disconnect', () => {

    })
})

module.exports =  {
    app,
    server
}