import {loadContacts} from './ui.js'
import { selectContact } from './ui.js'

async function loadLastChat() {
    const response = await fetch('data/contacts.json')
    if(!response.ok) throw new Error("Failed to fetch contacts")

    const contacts = await response.json()
    selectContact(contacts[0])
}

loadLastChat()
loadContacts()
