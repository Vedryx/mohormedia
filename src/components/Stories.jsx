import { useState } from "react";
import { useContent } from "../ContentContext";
import ContentMedia from "./ContentMedia";
import { useReveal, revealClass } from "../hooks/useReveal";
import "./Stories.css";
export default function Stories() {
  const { stories } = useContent();
  return stories.length ? <StoriesContent stories={stories} /> : null;
}
function StoriesContent({ stories }) {
  const [active, setActive] = useState(null);
  const [headRef, headSeen] = useReveal();
  const story = stories.find((s) => s.id === active) || stories[0];
  if (!story) return null;
  const hasMedia = story.kind !== "text";
  return (
    <section id="mm-stories" className="mm-stories" aria-label="Client stories">
      <div className="mm-shell">
        <div
          ref={headRef}
          className={revealClass(headSeen, "mm-stories__head")}
        >
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
          className={`mm-stories__card${hasMedia ? "" : " mm-stories__card--text"}`}
        >
          {hasMedia && (
            <div className="mm-stories__media mm-stories__media--live">
              <ContentMedia
                key={`${story.id}-${story.mediaUrl}`}
                item={story}
              />
            </div>
          )}
          <div className="mm-stories__quote-col">
            <div className="mm-stories__mark" aria-hidden="true">
              ”
            </div>
            <blockquote
              className="mm-stories__quote"
              style={{ fontSize: hasMedia ? "30px" : "40px" }}
            >
              {story.description}
            </blockquote>
            <div>
              <div className="mm-stories__author">{story.title}</div>
              <div className="mm-stories__role">{story.subtitle}</div>
            </div>
            {story.link && (
              <a
                style={{ color: "var(--mm-bone)", textDecoration: "underline" }}
                href={story.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit client ↗
              </a>
            )}
            <div
              className="mm-stories__tabs"
              aria-label="Choose a client story"
            >
              {stories.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={item.id === story.id}
                  className={`mm-stories__tab${item.id === story.id ? " is-active" : ""}`}
                  onClick={() => setActive(item.id)}
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
