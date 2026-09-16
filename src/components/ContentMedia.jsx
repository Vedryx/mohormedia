import { useState } from "react";
import { videoSource } from "../../shared/media";
import "./ContentMedia.css";
export default function ContentMedia({ item, compact = false }) {
  const [playing, setPlaying] = useState(false),
    [failed, setFailed] = useState(false);
  if (item.kind === "text") return null;
  if (!item.mediaUrl)
    return (
      <div className="mm-media-empty">
        Add {item.kind === "image" ? "an image" : "a video"} to see it here.
      </div>
    );
  if (failed)
    return (
      <div className="mm-media-empty">
        This media couldn’t load. Please try again later.
      </div>
    );
  if (item.kind === "image")
    return (
      <img
        className="mm-content-image"
        src={item.mediaUrl}
        alt={item.alt || item.title}
        loading="lazy"
        draggable={false}
        onError={() => setFailed(true)}
      />
    );
  const source = videoSource(item.mediaUrl);
  if (!source)
    return <div className="mm-media-empty">Add a supported video link.</div>;
  if (source.type === "file")
    return (
      <video
        className="mm-content-video"
        aria-label={item.title}
        src={source.url}
        poster={item.posterUrl || undefined}
        controls
        playsInline
        preload="metadata"
        onError={() => setFailed(true)}
      />
    );
  if (!playing)
    return (
      <button
        type="button"
        className={`mm-video-cover${compact ? " mm-video-cover--compact" : ""}`}
        onClick={() => setPlaying(true)}
        aria-label={`Play ${item.title}`}
      >
        {item.posterUrl && <img src={item.posterUrl} alt="" />}
        <span className="mm-video-play">▶</span>
        <span>Play video</span>
      </button>
    );
  return (
    <iframe
      className="mm-content-video"
      src={`${source.url}${source.url.includes("?") ? "&" : "?"}autoplay=1`}
      title={item.title}
      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
}
