const express = require('express')
const fs = require('fs')
const cors = require('cors')
const { log } = require('console')
const app = express()

app.use(cors())
app.use(express.json())

const MSG_PATH = './data/messages.json'
const CONTACTS_PATH = "./data/contacts.json"

app.post('/api/messages', (req,res) => {
    const {contactId,newMessage} = req.body

    const messagesData = JSON.parse(fs.readFileSync(MSG_PATH, 'utf8'))
    if(!messagesData[contactId]) 
        messagesData[contactId] = []
    messagesData[contactId].push(newMessage)
    fs.writeFileSync(MSG_PATH, JSON.stringify(messagesData, null,2))

    const contactsData = JSON.parse(fs.readFileSync(CONTACTS_PATH, 'utf8'))
    const contactIndex = contactsData.findIndex(c => c.id === contactId)
    if(contactIndex != -1) {
        contactsData[contactIndex].lastMessage = newMessage.text
        contactsData[contactIndex].lastMessageTime = newMessage.timestamp

        fs.writeFileSync(CONTACTS_PATH, JSON.stringify(contactsData, null,2))
    }

    res.status(200).send({status:'Saved'})
})

app.listen(3000, () => {
    console.log('Server running on port 3000')
})