import { useContent } from "../ContentContext";
import ContentMedia from "./ContentMedia";
import "./ClientMarquee.css";
export default function ClientMarquee() {
  const { brands } = useContent();
  if (!brands.length) return null;
  return (
    <section className="mm-marquee" aria-label="Brands we've helped bloom">
      <div className="mm-shell">
        <div className="mm-marquee__head">Brands we&apos;ve helped bloom</div>
        <div className="mm-brand-grid">
          {brands.map((item) => (
            <article className="mm-brand" key={item.id}>
              <ContentMedia
                key={`${item.id}-${item.mediaUrl}`}
                item={item}
                compact
              />
              <h3>{item.title}</h3>
              {item.description && <p>{item.description}</p>}
              {item.link && (
                <a href={item.link} target="_blank" rel="noopener noreferrer">
                  Visit brand ↗
                </a>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
