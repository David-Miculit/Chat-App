import {loadRooms, selectRoom, renderNewMessage} from './ui.js'

let activeRoomId = null
const messageForm = document.getElementById('message-form')
const messageInput = document.getElementById('message-input')
const loginButton = document.getElementById('login-btn')
let myUser = JSON.parse(localStorage.getItem('myUser')) || null
let socket

function setupSocketListeners() {
    if (!socket) return;

    socket.on('receive-message', (msg) => {
        if (activeRoomId && msg.roomId == activeRoomId && msg.senderId !== myUser.id) {
            renderNewMessage(msg, myUser)
        }
    })
}

async function changeChat(room) {
    activeRoomId = room.id
    selectRoom(room, myUser, socket)
    socket.emit('join-chat', room.id)
    window.changeChat = changeChat
}

async function init() {
    try{
        const rooms = await loadRooms()

        if(rooms && rooms.length > 0) {
            await changeChat(rooms[0])
        }
    } catch (err) {
        console.error("Init failed: ",err)
    }
}

messageForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const text = messageInput.value.trim()
    if(text !== "" && activeRoomId) {
        const newMessage = {
            id: Date.now(),
            senderId: myUser.id,
            roomId: activeRoomId,
            text,
            timestamp: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            })
        }

        renderNewMessage(newMessage, myUser)
        messageInput.value = ""

        try {
            await fetch('http://localhost:3000/api/messages', {
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body: JSON.stringify({roomId: activeRoomId, newMessage})
            })
        } catch (err) {
            console.error("Failed to save msg", err)
        }
    }
})

loginButton.addEventListener('click', () => {
    const username = document.getElementById('username-input').value.trim()
    if (!username) return alert("Please enter a username")

    myUser = {
        id: username
    }

    document.getElementById('login-screen').style.display = 'none'
    document.getElementById('chat-header-name').textContent = myUser.id

    if (!socket) {
        socket = io('http://127.0.0.1:3000')
        setupSocketListeners()
    }

    init()
})