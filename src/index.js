const { server } = require('./server')

const port = process.env.PORT

server.listen(port, () => {
    console.log(`Server up on port ${port}`)
    console.log(`Connected to ${process.env.MONGODB_URL}`)
})