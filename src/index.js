const app = require('./app')

const port = process.env.PORT

app.listen(port, () => {
    console.log(`Server up on port ${process.env.PORT}`)
    console.log(`Connected to ${process.env.MONGODB_URL}`)
})