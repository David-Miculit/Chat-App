export async function loadRooms() {
    try {
        const response = await fetch('http://localhost:3000/api/rooms')
        if(!response.ok) throw new Error("Failed to fetch rooms")

        const rooms = await response.json()
        const roomList = document.getElementById('room-list')

        while(roomList.firstChild) {
            roomList.removeChild(roomList.firstChild)
        }
        const fragment = document.createDocumentFragment()

        rooms.forEach(room => {
            const btn = document.createElement("button")
            btn.className = "w-full flex items-center p-3 hover:bg-blue-50 hover:shadow-sm transition-colors border-b border-gray-200"
            btn.dataset.id = room.id

            const img = document.createElement("img")
            img.className = "w-12 h-12 rounded-full flex-shrink-0"
            img.src = room.avatar
            img.alt = `${room.name}'s avatar`

            const infoDiv = document.createElement('div')
            infoDiv.className = "ml-3 flex-1 flex flex-col items-start overflow-hidden"

            const topRow = document.createElement('div')
            topRow.className = "flex items-center mb-1"

            const name = document.createElement('h3')
            name.className = "text-sm font-medium text-gray-900 truncate"
            name.textContent = room.name

            const time = document.createElement('span')
            time.className ="text-xs text-gray-500 ml-2"
            time.textContent = room.lastMessageTime

            topRow.append(name,time)

            const preview = document.createElement('p')
            preview.className = "text-xs text-gray-500 truncate w-full text-left"
            preview.textContent = room.lastMessage
            infoDiv.append(topRow, preview)
            btn.append(img, infoDiv)

            btn.addEventListener('click', () => {
                if (typeof window.changeChat === "function") {
                    window.changeChat(room)
                }
            })

            fragment.appendChild(btn)
        })

        roomList.appendChild(fragment)
        return rooms
    } catch (err) {
        console.error("Rooms error: ", err)
    }
}

export async function selectRoom(room, currentUser, socket) {
    window.activeRoomId = room.id

    document.getElementById('chat-header-name').textContent = room.name
    document.getElementById('chat-header-avatar').src = room.avatar
    document.getElementById('chat-header-status').textContent = room.status

    if(socket) {
        socket.emit('join-chat', room.id)
    }

    try {
        const response = await fetch(`http://localhost:3000/api/messages/${room.id}`)
        const thread = await response.json() || []

        const container = document.getElementById('message-container')

        while(container.firstChild) {
            container.removeChild(container.firstChild)
        }

        const fragment = document.createDocumentFragment()

        thread.forEach(msg => {
            const isMe = String(msg.senderId) === String(currentUser.id)

            const wrapper = document.createElement('div')
            wrapper.className = isMe ? 'flex flex-col items-end' : "flex flex-col justify-start"

            const bubble = document.createElement('div')
            bubble.className = isMe ? 'max-w-[65%] px-3 py-2 bg-blue-100 rounded-lg shadow-lg text-md text-gray-800' : 'max-w-[65%] px-3 py-2 bg-gray-200 rounded-lg shadow-lg text-md text-gray-800'

            if(!isMe) {
                const senderName = document.createElement('h2')
                senderName.className = 'font-bold text-xs mb-1'
                senderName.textContent = msg.senderId
                bubble.appendChild(senderName)
            }

            const text = document.createElement('p')
            text.textContent = msg.text

            const time = document.createElement('div')
            time.className = "text-[10px] text-gray-500 text-right"
            time.textContent = msg.timestamp

            bubble.append(text, time)
            wrapper.appendChild(bubble)
            fragment.appendChild(wrapper)
            })

            container.appendChild(fragment)

            container.scrollTop = container.scrollHeight
    } catch (err) {
        console.error('Error loading msg: ', err)
    }
}

export function renderNewMessage(msg, currentUser) {
    const container = document.getElementById('message-container')
    const isMe = String(msg.senderId) === String(currentUser.id)

    const wrapper = document.createElement('div')
    wrapper.className = isMe ? 'flex flex-col items-end' : "flex flex-col justify-start"

    const bubble = document.createElement('div')
    bubble.className = isMe ? 'max-w-[65%] px-3 py-2 bg-blue-100 rounded-lg shadow-lg text-md text-gray-800' : 'max-w-[65%] px-3 py-2 bg-gray-200 rounded-lg shadow-lg text-md text-gray-800'

    if (!isMe) {
        const senderName = document.createElement('h2')
        senderName.className = 'font-bold text-xs mb-1'
        senderName.textContent = msg.senderId
        bubble.appendChild(senderName)
    }

    const text = document.createElement('p')
    text.textContent = msg.text

    const time = document.createElement('div')
    time.className = "text-[10px] text-gray-500 text-right"
    time.textContent = msg.timestamp

    bubble.append(text, time)
    wrapper.appendChild(bubble)
    container.appendChild(wrapper)

    container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
    })
}
