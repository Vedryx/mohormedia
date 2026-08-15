import { useEffect, useState } from 'react';
import ImageSlot from './ImageSlot';

const PHOTO_FX_MS = 1450;
const PLAYER_FX_MS = 4400;

function TypeIcon({ type }) {
  if (type === 'video') {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
        <rect x="2.5" y="6" width="13" height="12" rx="2" />
        <path d="M16 12l5.5-3.5v7L16 12Z" />
      </svg>
    );
  }
  if (type === 'podcast') {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
        <rect x="9" y="2.6" width="6" height="10" rx="3" />
        <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" />
      </svg>
    );
  }
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <path d="M3 8.5h3l1.6-2.5h8.8L18 8.5h3v10H3z" />
      <circle cx="12" cy="13" r="3.4" />
    </svg>
  );
}

/** Camera-shutter flourish for photo sets. */
function ShutterFx() {
  return (
    <div className="mm-fx mm-fx--shutter" aria-hidden="true">
      <div className="mm-fx__blade mm-fx__blade--top" />
      <div className="mm-fx__blade mm-fx__blade--bottom" />
      <div className="mm-fx__flash" />
      <div className="mm-fx__frame">
        <i className="mm-fx__bracket mm-fx__bracket--tl" />
        <i className="mm-fx__bracket mm-fx__bracket--tr" />
        <i className="mm-fx__bracket mm-fx__bracket--bl" />
        <i className="mm-fx__bracket mm-fx__bracket--br" />
      </div>
      <div className="mm-fx__meta">f/2.8 · 1/125s</div>
    </div>
  );
}

/** Player intro flourish for films and podcast episodes. */
function PlayerFx({ label }) {
  return (
    <div className="mm-fx mm-fx--player" aria-hidden="true">
      <div className="mm-fx__iris">
        <svg width="28" height="32" viewBox="0 0 26 30">
          <path d="M2 2.5 24 15 2 27.5Z" fill="#22261a" />
        </svg>
      </div>
      <div className="mm-fx__scan" />
      <div className="mm-fx__bar">
        <div className="mm-fx__fill" />
      </div>
      <div className="mm-fx__chip">
        <i />
        {label}
      </div>
    </div>
  );
}

export default function WorkCard({ item, wasDragged }) {
  const [fx, setFx] = useState(false);

  useEffect(() => {
    if (!fx) return undefined;
    const timer = window.setTimeout(
      () => setFx(false),
      item.type === 'photo' ? PHOTO_FX_MS : PLAYER_FX_MS,
    );
    return () => window.clearTimeout(timer);
  }, [fx, item.type]);

  const play = () => {
    if (fx) return;
    if (wasDragged?.()) return;
    setFx(true);
  };

  const onKeyDown = (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    play();
  };

  return (
    <article
      className={`mm-work__card${fx ? ' is-playing' : ''}`}
      role="button"
      tabIndex={0}
      aria-label={`${item.title} — ${item.veilLabel}`}
      onClick={play}
      onKeyDown={onKeyDown}
    >
      <ImageSlot id={item.id} shape="rect" fit="cover" placeholder={item.placeholder} />

      <div className="mm-work__badge">
        <TypeIcon type={item.type} />
        {item.badge}
      </div>

      <div className="mm-work__veil">
        <span>{item.veilLabel}</span>
      </div>

      <div className="mm-work__caption">
        <div className="mm-work__title">{item.title}</div>
        <div className="mm-work__meta">
          <span>{item.meta}</span>
          <span className="mm-work__result">{item.result}</span>
        </div>
      </div>

      {fx
        ? item.type === 'photo'
          ? <ShutterFx />
          : <PlayerFx label={item.type === 'podcast' ? 'Now playing · Ep 08' : 'Now playing'} />
        : null}
    </article>
  );
}
