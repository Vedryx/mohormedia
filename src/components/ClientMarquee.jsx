import { Fragment } from 'react';
import { clients } from '../data/content';
import './ClientMarquee.css';

function Track({ ariaHidden }) {
  return (
    <div className="mm-marquee__track" aria-hidden={ariaHidden || undefined}>
      {clients.map((client) => (
        <Fragment key={client.name}>
          <span className={`mm-marquee__name mm-marquee__name--${client.style}`}>{client.name}</span>
          <span className="mm-marquee__sep" aria-hidden="true">
            ✿
          </span>
        </Fragment>
      ))}
    </div>
  );
}

export default function ClientMarquee() {
  return (
    <section className="mm-marquee" aria-label="Clients">
      <div className="mm-shell mm-marquee__head">Brands we&apos;ve helped bloom</div>
      <div className="mm-marquee__viewport">
        <div className="mm-marquee__rail">
          <Track />
          <Track ariaHidden />
        </div>
      </div>
    </section>
  );
}
