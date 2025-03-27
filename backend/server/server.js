const express = require('express');
const app = express()
const cors = require('cors')
const deviceRoutes = require('../router/deviceRoutes')
const WebSocket = require("ws")
const http = require('http')
const systemService = require('../service/systemService')


const PORT = 3000 || process.env.PORT 

app.use(cors())
app.use(express.json())

app.get("/", deviceRoutes)

const server = http.createServer(app)

const wss = new WebSocket.Server({ server})

wss.on('connection',(ws)=>{
    console.log('New WebSocket connection')
    const sendSystemInfo = () => {
        const info = systemService.getSystemInfo()
        ws.send(JSON.stringify(info))
    }
    sendSystemInfo()

    const interval = setInterval(sendSystemInfo , 3000)
    ws.on('close',() =>{
        clearInterval(interval)
    })

})

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

