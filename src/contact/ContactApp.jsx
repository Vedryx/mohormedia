import { useState } from 'react'
import BookingModal from './BookingModal.jsx'
import logo from '../assets/mohor-logo.png'

const ArrowIcon = () => (
  <svg className="cta-arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

const CalendarIcon = () => (
  <svg className="cta-lead" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4.5" width="18" height="17" rx="2" />
    <path d="M16 2.5v4M8 2.5v4M3 10h18" />
  </svg>
)

const PhoneIcon = () => (
  <svg className="cta-lead" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.2a2 2 0 0 1 2.1-.5c.9.4 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z" />
  </svg>
)

const WhatsAppIcon = () => (
  <svg className="cta-lead" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.6-.7L3 21l1.9-5a8.3 8.3 0 0 1-.9-3.7 8.4 8.4 0 0 1 8.4-8.4 8.4 8.4 0 0 1 8.6 7.6Z" />
  </svg>
)

const PHONE_DISPLAY = '+91 88558 78941'
const PHONE_TEL = '+918855878941'
const WHATSAPP = '918855878941'

const ACTIONS = [
  { action: 'book', variant: 'primary', Icon: CalendarIcon, title: 'Book a 15-minute call', sub: 'Pick a slot that suits you', subUpper: true },
  { href: `tel:${PHONE_TEL}`, variant: 'ghost', Icon: PhoneIcon, title: 'Call now', sub: PHONE_DISPLAY, tabular: true },
  { href: `https://wa.me/${WHATSAPP}`, external: true, variant: 'ghost', Icon: WhatsAppIcon, title: 'Message on WhatsApp', sub: 'Usually replies same day', subUpper: true },
]

function ActionInner({ Icon, title, sub, subUpper, tabular }) {
  return (
    <>
      <Icon />
      <span className="cta-body">
        <span className="cta-title">{title}</span>
        <span className={`cta-sub${subUpper ? ' cta-sub--upper' : ''}${tabular ? ' cta-sub--tabular' : ''}`}>{sub}</span>
      </span>
      <ArrowIcon />
    </>
  )
}

function ContactAction({ href, external, action, onBook, ...rest }) {
  const cls = `cta cta--${rest.variant}`
  if (action === 'book') {
    return <button type="button" className={cls} onClick={onBook}><ActionInner {...rest} /></button>
  }
  return (
    <a className={cls} href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>
      <ActionInner {...rest} />
    </a>
  )
}

export default function ContactApp() {
  const [booking, setBooking] = useState(false)
  return (
    <main className="stage">
      <section className="card">
        <header className="brand">
          <img className="brand-logo" src={logo} alt="Mohor Media" width="150" height="132" />
          <p className="tagline">Branding | Advertisements</p>
        </header>

        <div className="divider">
          <span className="divider-line divider-line--l" />
          <span className="divider-label">Get in touch</span>
          <span className="divider-line divider-line--r" />
        </div>

        <div className="actions">
          {ACTIONS.map((a, i) => (
            <ContactAction key={a.href || a.action || i} {...a} onBook={() => setBooking(true)} />
          ))}
        </div>

        <div className="save-row">
          <a className="save-link" href="/contact.vcf" download="MohorMedia.vcf">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
              <path d="M12 11a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM8 17a4 4 0 0 1 8 0" />
            </svg>
            Save contact
          </a>
        </div>
      </section>

      <footer className="foot">
        <span className="foot-tick" />
        <span className="foot-url">mohormedia.com</span>
      </footer>

      <BookingModal open={booking} onClose={() => setBooking(false)} />
    </main>
  )
}
