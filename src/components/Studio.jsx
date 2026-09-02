import ImageSlot from './ImageSlot';
import teamPhoto from '../assets/mohor-team.jpg';
import { studio } from '../data/content';
import { usePointerTilt } from '../hooks/usePointerTilt';
import { useReveal, revealClass } from '../hooks/useReveal';
import './Studio.css';

export default function Studio() {
  const [ref, seen] = useReveal();
  const tiltRef = usePointerTilt();

  return (
    <section id="mm-team" className="mm-studio" aria-label="Who you'll work with">
      <div className="mm-studio__art">
        <div className="mm-studio__blob">
          <div className="mm-studio__greeting">
            {studio.greeting.split('\n').map((line, index) => (
              <span key={line}>
                {line}
                {index === 0 ? <br /> : null}
              </span>
            ))}
          </div>
        </div>

        <div className="mm-studio__dots" aria-hidden="true" />

        <svg className="mm-studio__doodle" width="120" height="56" viewBox="0 0 60 28" aria-hidden="true">
          <path d="M3 23C14 11 30 5 52 7" fill="none" stroke="#454a2c" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M20 16c-4-3-9-2-9 1 4 2 8 1 9-1z" fill="none" stroke="#454a2c" strokeWidth="1.2" />
          <path d="M33 11c-2-4 0-8 3-8 1 4-1 7-3 8z" fill="none" stroke="#454a2c" strokeWidth="1.2" />
          <circle cx="53" cy="6" r="2.4" fill="#e8a020" />
        </svg>

        <div className="mm-studio__photo" ref={tiltRef}>
          <div className="mm-studio__tilt">
            {/* Saffron plate pushed back in Z — the parallax between it and the
                photo is what reads as depth when the card turns. */}
            <div className="mm-studio__plate" aria-hidden="true" />
            <div className="mm-studio__frame">
              <ImageSlot
                id="team-greeting"
                src={teamPhoto}
                alt="The Mohor Media founders"
                shape="rounded"
                radius={14}
                fit="cover"
                editable={false}
              />
              <div className="mm-studio__glare" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      <div ref={ref} className={revealClass(seen, 'mm-studio__copy')}>
        <div className="mm-eyebrow">
          <span className="mm-eyebrow__mark" aria-hidden="true">
            ✿
          </span>
          <span>Who you&apos;ll work with</span>
        </div>

        <h2 className="mm-studio__title">
          {studio.headline}
          <span className="mm-italic">{studio.headlineItalic}</span>
        </h2>

        <p className="mm-studio__body">{studio.body}</p>

        <div className="mm-studio__chips">
          {studio.chips.map((chip) => (
            <span key={chip} className="mm-chip">
              {chip}
            </span>
          ))}
        </div>

        <a className="mm-studio__link" href="#mm-process">
          See how we work <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  );
}
