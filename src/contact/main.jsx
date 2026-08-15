import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ContactApp from './ContactApp.jsx'
import './contact.css'

createRoot(document.getElementById('contact-root')).render(
  <StrictMode>
    <ContactApp />
  </StrictMode>,
)
