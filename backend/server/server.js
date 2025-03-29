const express = require('express');
const app = express()
const cors = require('cors')
const deviceRoutes = require('../router/deviceRoutes')
const WebSocket = require("ws")
const http = require('http')
const systemService = require('../service/systemService')
const dotenv = require('dotenv')
const os = require('os');
const { error } = require('console');

dotenv.config()
const PORT = 3000 || process.env.PORT 

app.use(cors())
app.use(express.json())

app.get("/", deviceRoutes)

const server = http.createServer(app)

const wss = new WebSocket.Server({ server})

wss.on('connection',(ws)=>{
    console.log('New WebSocket connection')
   
    sendSystemInfo()

    const intervalId = setInterval(()=>{
        sendSystemInfo(ws)
    },3000)

    ws.on('close',() =>{
        console.log('Client disconnected from WebSocket')
        clearInterval(intervalId)
    })
    ws.on('error',(err)=>{
        console.error('websocket error',err)
        clearInterval(intervalId)
    })

})


async function sendSystemInfo(ws){
    try{
        const systemInfo = await systemService.getSystemInfo()

        if(ws.readyState === WebSocket.OPEN){
            ws.send(JSON.stringify(systemInfo))
        }
    }catch(err){
        console.error('error getting system info',error)
        if(ws.readyState === WebSocket.OPEN){
            ws.send(JSON.stringify({
                error :'Failed to get sys information',
                message : error.message
            }))
        }
    }
}


server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
    console.log(`WebSocket server available at ws://localhost:${PORT}`);
})

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

