import { useEffect, useRef, useState } from 'react';
import { crafts } from '../data/content';
import { useReveal, revealClass } from '../hooks/useReveal';
import './Craft.css';

/**
 * Rows wipe in from the left. Rows that enter the viewport together are
 * staggered as a batch (rather than by absolute index), so a row scrolled to on
 * its own animates immediately instead of waiting its turn.
 */
function useBatchedRowReveal(count) {
  const rowRefs = useRef([]);
  const [revealed, setRevealed] = useState(() => new Map());

  useEffect(() => {
    const rows = rowRefs.current.filter(Boolean);
    if (!rows.length) return undefined;

    if (typeof IntersectionObserver === 'undefined') {
      setRevealed(new Map(rows.map((_, index) => [index, 0])));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const hits = entries.filter((entry) => entry.isIntersecting).map((entry) => entry.target);
        if (!hits.length) return;
        hits.forEach((target) => observer.unobserve(target));

        setRevealed((current) => {
          const next = new Map(current);
          hits.forEach((target, batchIndex) => {
            const index = rows.indexOf(target);
            if (index >= 0 && !next.has(index)) next.set(index, batchIndex);
          });
          return next;
        });
      },
      { rootMargin: '0px 0px -14% 0px', threshold: 0.15 },
    );

    rows.forEach((row) => observer.observe(row));
    const safety = window.setTimeout(() => {
      setRevealed((current) => {
        if (current.size === rows.length) return current;
        const next = new Map(current);
        rows.forEach((_, index) => {
          if (!next.has(index)) next.set(index, 0);
        });
        return next;
      });
    }, 9000);

    return () => {
      observer.disconnect();
      window.clearTimeout(safety);
    };
  }, [count]);

  return { rowRefs, revealed };
}

export default function Craft() {
  const [headRef, headSeen] = useReveal();
  const [ledeRef, ledeSeen] = useReveal();
  const { rowRefs, revealed } = useBatchedRowReveal(crafts.length);

  return (
    <section id="mm-craft" className="mm-craft" aria-label="What we do">
      <div className="mm-shell">
        <div className="mm-craft__head">
          <div ref={headRef} className={revealClass(headSeen)}>
            <div className="mm-eyebrow">
              <span className="mm-eyebrow__mark" aria-hidden="true">
                ✿
              </span>
              <span>What we do</span>
            </div>
            <h2 className="mm-section-title mm-craft__title">
              Six crafts.
              <br />
              One <span className="mm-italic">obsession</span> — growth.
            </h2>
          </div>
          <p ref={ledeRef} className={revealClass(ledeSeen, 'mm-lede')}>
            Every service is grown in-house by specialists who talk to each other — so your brand
            never has to repeat itself.
          </p>
        </div>

        <ul className="mm-craft__list">
          {crafts.map((craft, index) => {
            const batchIndex = revealed.get(index);
            const isRevealed = batchIndex !== undefined;
            return (
              <li
                key={craft.number}
                ref={(node) => {
                  rowRefs.current[index] = node;
                }}
                className={`mm-craft__row${isRevealed ? ' is-revealed' : ''}`}
                style={isRevealed ? { '--mm-stagger': `${batchIndex * 110}ms` } : undefined}
              >
                <a className="mm-craft__link" href="#mm-book">
                  <span className="mm-craft__number">{craft.number}</span>
                  <span className="mm-craft__body">
                    <span className="mm-craft__name">{craft.title}</span>
                    <span className="mm-craft__desc">{craft.description}</span>
                    <span className="mm-craft__tags">
                      {craft.tags.map((tag) => (
                        <span key={tag} className="mm-chip">
                          {tag}
                        </span>
                      ))}
                    </span>
                  </span>
                  <span className="mm-craft__arrow" aria-hidden="true">
                    ↗
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
