import { Fragment } from 'react';
import { clients } from '../data/content';
import './ClientMarquee.css';

// With only a handful of logos one pass is narrower than the viewport, which
// would open a gap mid-scroll. Repeating the set fills the rail; the animation
// still translates exactly -50%, so the seam stays invisible.
const REPEATS = 3;

function Track({ ariaHidden }) {
  return (
    <div className="mm-marquee__track" aria-hidden={ariaHidden || undefined}>
      {Array.from({ length: REPEATS }).flatMap((_, pass) =>
        clients.map((client) => (
          <Fragment key={`${pass}-${client.name}`}>
            <img
              className="mm-marquee__logo"
              src={client.logo}
              width={client.width}
              height={client.height}
              alt={pass === 0 && !ariaHidden ? client.name : ''}
              aria-hidden={pass === 0 && !ariaHidden ? undefined : true}
              loading="lazy"
              draggable={false}
            />
            <span className="mm-marquee__sep" aria-hidden="true">
              ✿
            </span>
          </Fragment>
        )),
      )}
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
