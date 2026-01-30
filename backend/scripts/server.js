const express = require('express')
const fs = require('fs')
const cors = require('cors')
const { log } = require('console')
const {createServer} = require('http')
const {Server} = require('socket.io')

const path = require('path')
const MSG_PATH = path.join(__dirname, '..', 'data', 'messages.json')
const ROOMS_PATH = path.join(__dirname, '..', 'data', 'rooms.json')

const app = express()
app.use(cors({
    origin: '*'
}))

app.use(express.json())

const httpServer=createServer(app)

const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
})

io.on('connection', (socket => {
    console.log('User connected: ', socket.id)

    socket.on('join-chat', (roomId) => {
        socket.join(roomId)
        console.log(`Socket ${socket.id} joined room ${roomId}`)
    })

    socket.on('disconnect', () => {
        console.log(`Socket ${socket.id} disconnected`)
    })
}))

app.get('/api/messages/:roomId', (req, res) => {
  try {
    const messagesData = JSON.parse(fs.readFileSync(MSG_PATH, 'utf8'))
    const roomMessages = messagesData[req.params.roomId] || []
    res.json(roomMessages)
  } catch (err) {
    console.error('Failed to read messages:', err)
    res.status(500).json({ error: 'Failed to load messages' })
  }
})

app.get('/api/rooms', (req, res) => {
    const roomsData = JSON.parse(
        fs.readFileSync(ROOMS_PATH, 'utf8')
    )
    res.json(roomsData)
})

app.post('/api/messages', (req,res) => {
    const { newMessage } = req.body
    const roomId = newMessage.roomId

    const messagesData = JSON.parse(fs.readFileSync(MSG_PATH, 'utf8'))
    if(!messagesData[roomId]) 
        messagesData[roomId] = []
    messagesData[roomId].push(newMessage)
    fs.writeFileSync(MSG_PATH, JSON.stringify(messagesData, null,2))

    const roomsData = JSON.parse(fs.readFileSync(ROOMS_PATH, 'utf8'))
    const roomIndex = roomsData.findIndex(c => c.id === roomId)
    if(roomIndex != -1) {
        roomsData[roomIndex].lastMessage = newMessage.text
        roomsData[roomIndex].lastMessageTime = newMessage.timestamp

        fs.writeFileSync(ROOMS_PATH, JSON.stringify(roomsData, null,2))
    }

    io.to(roomId).emit('receive-message', newMessage)

    res.status(200).send({status:'Saved'})
})

httpServer.listen(3000, '0.0.0.0', () => {
    console.log('Server running on port 3000')
})