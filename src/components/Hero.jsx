import ImageSlot from './ImageSlot';
import { useBooking } from '../BookingContext';
import { heroStats } from '../data/content';
import { useReveal, revealClass } from '../hooks/useReveal';
import { useScrollY } from '../hooks/useScrollY';
import { getMotion, siteConfig } from '../siteConfig';
import './Hero.css';

export default function Hero() {
  const [badgeRef, badgeSeen] = useReveal();
  const [titleRef, titleSeen] = useReveal();
  const [copyRef, copySeen] = useReveal();
  const [ctaRef, ctaSeen] = useReveal();
  const [statsRef, statsSeen] = useReveal();
  const { openBooking } = useBooking();

  const scrollY = useScrollY();
  const { parallax } = getMotion();
  const artStyle =
    parallax && scrollY < 1200 ? { transform: `translateY(${scrollY * -parallax}px)` } : undefined;

  return (
    <section id="mm-top" className="mm-hero" aria-label="Hero">
      <div className="mm-hero__watermark" aria-hidden="true">
        मोहोर
      </div>

      <div className="mm-hero__grid mm-shell">
        <div className="mm-hero__copy">
          <div ref={badgeRef} className={revealClass(badgeSeen, 'mm-hero__badge')}>
            <span className="mm-hero__badge-mark" aria-hidden="true">
              ✦
            </span>
            <span>Marketing &amp; Advertising Studio</span>
          </div>

          <h1 ref={titleRef} className={revealClass(titleSeen, 'mm-hero__title')}>
            Ideas that <span className="mm-italic">bloom</span> into bold brands.
          </h1>

          <p ref={copyRef} className={revealClass(copySeen, 'mm-hero__lede')}>
            Mohor Media is a full-service creative studio crafting brands, campaigns and stories
            people remember — rooted in insight, grown with craft.
          </p>

          <div ref={ctaRef} className={revealClass(ctaSeen, 'mm-hero__actions')}>
            <a className="mm-btn mm-btn--saffron" href="#mm-book" onClick={openBooking}>
              Book a Free Call <span aria-hidden="true">↗</span>
            </a>
            <a className="mm-btn mm-btn--ghost" href="#mm-work">
              See Our Work
            </a>
          </div>

          {siteConfig.showHeroStats ? (
            <dl ref={statsRef} className={revealClass(statsSeen, 'mm-hero__stats')}>
              {heroStats.map((stat) => (
                <div key={stat.label}>
                  <dt>{stat.value}</dt>
                  <dd>{stat.label}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>

        <div className="mm-hero__art" style={artStyle}>
          <div className="mm-hero__blob" aria-hidden="true" />

          <div className="mm-hero__photo">
            <ImageSlot
              id="v2-hero"
              shape="rect"
              fit="cover"
              placeholder="Drop the studio / team-at-work photo"
            />
          </div>

          <div className="mm-hero__card">
            <div className="mm-hero__card-label">Currently blooming</div>
            <div className="mm-hero__card-title">Saffron Street Rebrand</div>
          </div>

          <div className="mm-hero__seal" aria-hidden="true">
            <svg viewBox="0 0 132 132" className="mm-hero__seal-ring">
              <defs>
                <path
                  id="mm-seal-path"
                  d="M66,66 m-48,0 a48,48 0 1,1 96,0 a48,48 0 1,1 -96,0"
                />
              </defs>
              <text>
                <textPath href="#mm-seal-path">MOHOR MEDIA • CREATIVE GROWTH • </textPath>
              </text>
            </svg>
            <div className="mm-hero__seal-arrow">↓</div>
          </div>
        </div>
      </div>
    </section>
  );
}
