import logo, { logoIsSquare } from '../assets/logo';
import { useBooking } from '../BookingContext';
import { contact, footerColumns } from '../data/content';
import './Footer.css';

const socials = [
  {
    label: 'Instagram',
    href: '#',
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: '#',
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M4.5 8.5h3v11h-3zM6 4a1.8 1.8 0 1 1 0 3.6A1.8 1.8 0 0 1 6 4Zm4.5 4.5h3v1.6c.6-1 1.8-1.9 3.4-1.9 2.4 0 3.6 1.6 3.6 4.4v6.9h-3v-6.2c0-1.5-.6-2.3-1.8-2.3-1.3 0-2.2.9-2.2 2.4v6.1h-3Z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: '#',
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
        <path d="m10.5 9.5 5 2.5-5 2.5z" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

export default function Footer() {
  const { openBooking } = useBooking();

  return (
    <footer className="mm-footer">
      <div className="mm-shell">
        <div className="mm-footer__grid">
          <div className="mm-footer__brand-col">
            <div className="mm-footer__brand">
              <img
                src={logo}
                alt="Mohor Media"
                className={logoIsSquare ? 'mm-mark--round' : 'mm-mark--free'}
              />
              {/* The full-bleed artwork already carries मोहोर / MEDIA., so the
                  lettering is only set separately when the mark is circle-cropped. */}
              {logoIsSquare ? (
                <div>
                  <div className="mm-footer__deva">मोहोर</div>
                  <div className="mm-footer__wordmark">MEDIA.</div>
                </div>
              ) : null}
            </div>

            <p className="mm-footer__blurb">
              A marketing &amp; advertising studio growing brands with roots in insight and petals of
              craft. Ideas that bloom into bold brands.
            </p>

            <div className="mm-footer__socials">
              {socials.map((social) => (
                <a key={social.label} href={social.href} aria-label={social.label}>
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {footerColumns.map((column) => (
            <nav key={column.title} className="mm-footer__col" aria-label={column.title}>
              <div className="mm-footer__col-title">{column.title}</div>
              {column.links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={link.href === '#mm-book' ? openBooking : undefined}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          ))}

          <div className="mm-footer__col">
            <div className="mm-footer__col-title">Contact</div>
            <a href={`mailto:${contact.email}`}>
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#e2913f" strokeWidth="1.7" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="3" />
                <path d="m4 7 8 6 8-6" />
              </svg>
              {contact.email}
            </a>
            <a href={`tel:${contact.phoneHref}`}>
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#e2913f" strokeWidth="1.7" aria-hidden="true">
                <path d="M5 4h3l2 5-2 1a10 10 0 0 0 6 6l1-2 5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
              </svg>
              {contact.phone}
            </a>
            <div className="mm-footer__static">
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#e2913f" strokeWidth="1.7" aria-hidden="true">
                <path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              {contact.location}
            </div>
          </div>
        </div>

        <div className="mm-footer__base">
          <div>© {new Date().getFullYear()} Mohor Media. Grown with care in India.</div>
          <div className="mm-footer__sign">
            <span aria-hidden="true">✿</span>Ideas that bloom into bold brands.
          </div>
        </div>
      </div>
    </footer>
  );
}
