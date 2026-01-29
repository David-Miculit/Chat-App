import {loadContacts, selectContact, renderNewMessage} from './ui.js'

// async function loadLastChat() {
//     const response = await fetch('data/contacts.json')
//     if(!response.ok) throw new Error("Failed to fetch contacts")

//     const contacts = await response.json()
//     selectContact(contacts[0])
// }
// loadLastChat()

async function init() {
    try{
        const contacts = await loadContacts()

        if(contacts && contacts.length > 0) {
            const firstContact = contacts[0]
            activeContactId = firstContact.id
            selectContact(firstContact)
        }
    } catch (err) {
        console.error("Init failed: ",err)
    }
}

let activeContactId = null
const messageForm = document.getElementById('message-form')
const messageInput = document.getElementById('message-input')

messageForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    e.stopImmediatePropagation()

    const text = messageInput.value.trim()
    if(text !== "" && activeContactId) {
        const newMessage= {
            senderId:"me",
            text: text,
            timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
        }

        renderNewMessage(newMessage)
        messageInput.value = ""

        try {
            await fetch('http://localhost:3000/api/messages', {
                method: 'POST',
                headers: {"Content-Type": 'application/json'},
                body: JSON.stringify({
                    contactId: activeContactId,
                    newMessage: newMessage
                })
            })
        } catch (err) {
            console.error("Failed to save msg", err)
        }
    }
})

init()