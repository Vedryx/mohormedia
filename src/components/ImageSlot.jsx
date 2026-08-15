import { useCallback, useEffect, useRef, useState } from 'react';
import './ImageSlot.css';

const STORAGE_KEY = 'mohormedia.image-slots';

function readStore() {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeStore(next) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* quota or private mode — the slot still works for this session */
  }
}

/**
 * React port of the design canvas's `<image-slot>`: a user-fillable image
 * placeholder. Pass a real `src` to ship a fixed image, or leave it empty and
 * drop / pick a file — the choice persists in localStorage under the slot id,
 * the same idea as the canvas's `.image-slots.state.json` sidecar.
 */
export default function ImageSlot({
  id,
  src: initialSrc = '',
  alt = '',
  placeholder = 'Drop an image',
  shape = 'rounded',
  radius = 12,
  fit = 'cover',
  editable = true,
  className = '',
}) {
  const [src, setSrc] = useState(initialSrc);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (initialSrc || !id) return;
    const stored = readStore()[id];
    if (stored) setSrc(stored);
  }, [id, initialSrc]);

  const acceptFile = useCallback(
    (file) => {
      if (!file || !file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result);
        setSrc(dataUrl);
        if (id) writeStore({ ...readStore(), [id]: dataUrl });
      };
      reader.readAsDataURL(file);
    },
    [id],
  );

  const onDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    if (!editable) return;
    acceptFile(event.dataTransfer?.files?.[0]);
  };

  const onDragOver = (event) => {
    if (!editable) return;
    event.preventDefault();
    setDragOver(true);
  };

  const clear = (event) => {
    event.stopPropagation();
    setSrc('');
    if (!id) return;
    const store = readStore();
    delete store[id];
    writeStore(store);
  };

  const style = {
    borderRadius: shape === 'circle' ? '50%' : shape === 'pill' ? '999px' : shape === 'rect' ? 0 : `${radius}px`,
  };

  const classes = [
    'mm-slot',
    src ? 'mm-slot--filled' : 'mm-slot--empty',
    dragOver ? 'mm-slot--over' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (src) {
    return (
      <div className={classes} style={style} onDrop={onDrop} onDragOver={onDragOver} onDragLeave={() => setDragOver(false)}>
        <img src={src} alt={alt} style={{ objectFit: fit }} draggable={false} />
        {editable ? (
          <button type="button" className="mm-slot__clear" onClick={clear} aria-label={`Remove ${alt || 'image'}`}>
            ×
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={classes}
      style={style}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={() => setDragOver(false)}
    >
      <button
        type="button"
        className="mm-slot__pick"
        onClick={() => inputRef.current?.click()}
        disabled={!editable}
      >
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <rect x="3" y="4" width="18" height="16" rx="3" />
          <circle cx="8.6" cy="9.4" r="1.7" />
          <path d="m4 17 5-5 4 4 3-2.5 4 3.5" />
        </svg>
        <span>{placeholder}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => acceptFile(event.target.files?.[0])}
      />
    </div>
  );
}
