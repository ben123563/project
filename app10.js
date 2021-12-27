const express = require('express')
const app = express()
//let {hotels} = require('./database')
const hotels = require('./hotels')
const orders = require('./orders')

app.use(express.json())
app.use('/api/hotel', hotels)
app.use('/api/hotels/order', orders)

app.listen(5000, ()=>{
    console.log("server is listening on port 5000...")
})
