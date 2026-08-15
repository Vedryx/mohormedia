import { useState } from 'react';
import ImageSlot from './ImageSlot';
import { stories } from '../data/content';
import { useReveal, revealClass } from '../hooks/useReveal';
import { siteConfig } from '../siteConfig';
import './Stories.css';

export default function Stories() {
  const [active, setActive] = useState(0);
  const [headRef, headSeen] = useReveal();
  const [cardRef, cardSeen] = useReveal();

  const story = stories[active];
  const forced = siteConfig.storyMedia;
  const kind = forced === 'as authored' ? story.kind : forced;
  const hasMedia = kind !== 'text';
  const isVideo = kind === 'video';

  return (
    <section id="mm-stories" className="mm-stories" aria-label="Client stories">
      <div className="mm-shell">
        <div ref={headRef} className={revealClass(headSeen, 'mm-stories__head')}>
          <div className="mm-eyebrow mm-eyebrow--light">
            <span className="mm-eyebrow__mark" aria-hidden="true">
              ✿
            </span>
            <span>Client stories</span>
          </div>
          <h2 className="mm-section-title mm-section-title--light mm-stories__title">
            Kind words, <span className="mm-italic">loud results.</span>
          </h2>
        </div>

        <div
          ref={cardRef}
          className={revealClass(cardSeen, `mm-stories__card${hasMedia ? '' : ' mm-stories__card--text'}`)}
        >
          {hasMedia ? (
            <div className="mm-stories__media">
              {stories.map((item, index) => (
                <div
                  key={item.id}
                  className={`mm-stories__frame${index === active ? ' is-active' : ''}`}
                  aria-hidden={index === active ? undefined : true}
                >
                  <ImageSlot id={item.id} shape="rect" fit="cover" placeholder={item.placeholder} />
                </div>
              ))}

              <div className="mm-stories__label">{isVideo ? 'Watch her story' : 'On location'}</div>

              {isVideo ? (
                <>
                  <button type="button" className="mm-stories__play" aria-label="Play testimonial">
                    <svg width="26" height="30" viewBox="0 0 26 30" aria-hidden="true">
                      <path d="M2 2.5 24 15 2 27.5Z" fill="#22261a" />
                    </svg>
                  </button>
                  <div className="mm-stories__runtime">
                    {story.runtime || 'Full film on request'}
                  </div>
                </>
              ) : null}
            </div>
          ) : null}

          <div className="mm-stories__quote-col">
            <div className="mm-stories__mark" aria-hidden="true">
              ”
            </div>
            <blockquote
              className="mm-stories__quote"
              style={{ fontSize: hasMedia ? '30px' : '40px' }}
            >
              {story.quote}
            </blockquote>
            <div>
              <div className="mm-stories__author">{story.author}</div>
              <div className="mm-stories__role">{story.role}</div>
            </div>

            <div className="mm-stories__tabs" role="tablist" aria-label="Client stories">
              {stories.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={index === active}
                  className={`mm-stories__tab${index === active ? ' is-active' : ''}`}
                  onClick={() => setActive(index)}
                >
                  {item.tab}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
