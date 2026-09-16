import ContentMedia from "./ContentMedia";
export default function WorkCard({ item }) {
  return (
    <article
      className={`mm-work__card mm-work__card--live${item.kind === "text" ? " mm-work__card--text" : ""}`}
    >
      <ContentMedia key={`${item.id}-${item.mediaUrl}`} item={item} />
      <div className="mm-work__body">
        {item.category !== "Other" && (
          <span className="mm-work__category">{item.category}</span>
        )}
        <h3>{item.title}</h3>
        {item.subtitle && <p>{item.subtitle}</p>}
        {item.description && <p>{item.description}</p>}
        {item.result && <strong>{item.result}</strong>}
        {item.link && (
          <a href={item.link} target="_blank" rel="noopener noreferrer">
            View project ↗
          </a>
        )}
      </div>
    </article>
  );
}
