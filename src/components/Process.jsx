import { process } from '../data/content';
import { useReveal, revealClass } from '../hooks/useReveal';
import './Process.css';

const icons = {
  listen: (
    <>
      <path d="M6 8a6 6 0 0 1 12 0c0 3-2 4-3 6s0 4-3 4" />
      <circle cx="11" cy="9" r="2" />
    </>
  ),
  shape: (
    <>
      <path d="M4 20 8 19 20 7a2.5 2.5 0 0 0-3.5-3.5L4.5 15.5 4 20Z" />
      <path d="M14.5 6 18 9.5" />
    </>
  ),
  craft: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M12 12v9" />
      <path d="M12 17c-3 0-4-2-4-3 2 0 4 1 4 3Z" />
    </>
  ),
  launch: (
    <>
      <path d="M5 15c4-10 9-11 14-11 0 5-1 10-11 14" />
      <path d="M5 15l4 4" />
      <path d="M6 19l-2 2" />
    </>
  ),
};

function Step({ step }) {
  const [ref, seen] = useReveal();

  return (
    <li ref={ref} className={revealClass(seen, 'mm-process__step')}>
      <div className="mm-process__number" aria-hidden="true">
        {step.number}
      </div>
      <div className="mm-process__body">
        <div className="mm-process__heading">
          <span className="mm-process__icon" aria-hidden="true">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              {icons[step.icon]}
            </svg>
          </span>
          <h3 className="mm-process__title">{step.title}</h3>
        </div>
        <p className="mm-process__desc">{step.description}</p>
      </div>
    </li>
  );
}

export default function Process() {
  const [headRef, headSeen] = useReveal();

  return (
    <section id="mm-process" className="mm-process" aria-label="Our process">
      <div className="mm-shell">
        <div ref={headRef} className={revealClass(headSeen, 'mm-process__head')}>
          <div className="mm-eyebrow">
            <span className="mm-eyebrow__mark" aria-hidden="true">
              ✿
            </span>
            <span>Our process</span>
          </div>
          <h2 className="mm-section-title mm-process__title-main">
            Four chapters,
            <br />
            from <span className="mm-italic">seed</span> to bloom.
          </h2>
        </div>

        <ul className="mm-process__grid">
          {process.map((step) => (
            <Step key={step.number} step={step} />
          ))}
        </ul>
      </div>
    </section>
  );
}
