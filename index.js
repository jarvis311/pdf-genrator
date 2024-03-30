const express = require('express')
const cors = require('cors')
const mainRouter = require('./src/routes/main.routes.js')  
require('dotenv').config()

const app = express()
app.get('/home',(req,res) => {
    res.send(`<h1>Hello Ubuntu </h1>`)
})
app.use('/api',mainRouter)
app.listen(process.env.PORT, () => {
    console.log("Server is connected")
})