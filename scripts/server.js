const express = require('express')
const fs = require('fs')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.json())

const MSG_PATH = './data/messages.json'

app.post('/api/messages', (req,res) => {
    const {contactId,newMessage} = req.body

    const data = JSON.parse(fs.readFileSync(MSG_PATH, 'utf8'))

    if(!data[contactId]) 
        data[contactId] = []
    data[contactId].push(newMessage)

    fs.writeFileSync(MSG_PATH, JSON.stringify(data, null,2))
    res.status(200).send({status:'Saved'})
})

app.listen(3000, () => {
    console.log('Server running on port 3000')
})