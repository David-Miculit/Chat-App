export async function loadContacts() {
    try {
        const response = await fetch('data/contacts.json')
        if(!response.ok) throw new Error("Failed to fetch contacts")

        const contacts = await response.json()
        const contactList = document.getElementById('contact-list')

        while(contactList.firstChild) {
            contactList.removeChild(contactList.firstChild)
        }
        const fragment = document.createDocumentFragment()

        contacts.forEach(contact => {
            const btn = document.createElement("button")
            btn.className = "w-full flex items-center p-3 hover:bg-blue-50 hover:shadow-sm transition-colors border-b border-gray-200"
            btn.dataset.id = contact.id

            const img = document.createElement("img")
            img.className = "w-12 h-12 rounded-full flex-shrink-0"
            img.src = contact.avatar
            img.alt = `${contact.name}'s avatar`

            const infoDiv = document.createElement('div')
            infoDiv.className = "ml-3 flex-1 flex flex-col items-start overflow-hidden"

            const topRow = document.createElement('div')
            topRow.className = "flex items-center mb-1"

            const name = document.createElement('h3')
            name.className = "text-sm font-medium text-gray-900 truncate"
            name.textContent = contact.name

            const time = document.createElement('span')
            time.className ="text-xs text-gray-500 ml-2"
            time.textContent = contact.lastMessageTime

            topRow.append(name,time)

            const preview = document.createElement('p')
            preview.className = "text-xs text-gray-500 truncate w-full text-left"
            preview.textContent = contact.lastMessage
            infoDiv.append(topRow, preview)
            btn.append(img, infoDiv)

            btn.addEventListener('click', () => selectContact(contact))

            fragment.appendChild(btn)
        })

        contactList.appendChild(fragment)
        return contacts
    } catch (err) {
        console.error("Contacts error: ", err)
    }
}

export async function selectContact(contact) {
    document.getElementById('chat-header-name').textContent = contact.name
    document.getElementById('chat-header-avatar').src = contact.avatar
    document.getElementById('chat-header-status').textContent = contact.status

    try {
        const response = await fetch('data/messages.json')
        const allMessages = await response.json()
        const thread = allMessages[contact.id] || []

        const container = document.getElementById('message-container')

        // clear chat
        while(container.firstChild) {
            container.removeChild(container.firstChild)
        }

        const fragment = document.createDocumentFragment()

        thread.forEach(msg => {
            const isMe = msg.senderId ==='me'

            const wrapper = document.createElement('div')
            wrapper.className = isMe ? 'flex flex-col items-end' : "flex flex-col justify-start"

            const bubble = document.createElement('div')
            bubble.className = isMe ? 'max-w-[65%] px-3 py-2 bg-blue-100 rounded-lg shadow-lg text-md text-gray-800' : 'max-w-[65%] px-3 py-2 bg-gray-200 rounded-lg shadow-lg text-md text-gray-800'

            if(!isMe) {
                const senderName = document.createElement('h2')
                senderName.className = 'font-bold text-xs mb-1'
                senderName.textContent = contact.name
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

            // autoscroll jos
            container.scrollTop = container.scrollHeight
    } catch (err) {
        console.error('Error loading msg: ', err)
    }
}

export function renderNewMessage(msg) {
    const container = document.getElementById('message-container')
    const isMe = msg.senderId ==='me'

    const wrapper = document.createElement('div')
    wrapper.className = isMe ? 'flex flex-col items-end' : "flex flex-col justify-start"

    const bubble = document.createElement('div')
    bubble.className = isMe ? 'max-w-[65%] px-3 py-2 bg-blue-100 rounded-lg shadow-lg text-md text-gray-800' : 'max-w-[65%] px-3 py-2 bg-gray-200 rounded-lg shadow-lg text-md text-gray-800'

    const text = document.createElement('p')
    text.textContent = msg.text

    const time = document.createElement('div')
    time.className = "text-[10px] text-gray-500 text-right"
    time.textContent = msg.timestamp

    bubble.append(text, time)
    wrapper.appendChild(bubble)
    container.appendChild(wrapper)

    container.scrollTo({
        top:container.scrollHeight,
        behavior:'smooth'
    })
}