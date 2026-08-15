import WorkCard from './WorkCard';
import { work } from '../data/content';
import { useDragScroll } from '../hooks/useDragScroll';
import { useReveal, revealClass } from '../hooks/useReveal';
import './Work.css';

export default function Work() {
  const [headRef, headSeen] = useReveal();
  const { ref: stripRef, wasDragged } = useDragScroll();

  return (
    <section id="mm-work" className="mm-work" aria-label="Featured work">
      <div className="mm-shell">
        <div ref={headRef} className={revealClass(headSeen, 'mm-work__head')}>
          <div>
            <div className="mm-eyebrow">
              <span className="mm-eyebrow__mark" aria-hidden="true">
                ✿
              </span>
              <span>Featured work</span>
            </div>
            <h2 className="mm-section-title mm-work__title">
              Work that <span className="mm-italic">worked.</span>
            </h2>
          </div>
          <div className="mm-work__intro">
            <p className="mm-lede">
              A few recent blooms — rebrands, campaigns and content engines that moved real numbers
              for real businesses.
            </p>
            <div className="mm-work__hint">
              Drag or scroll sideways <span aria-hidden="true">→</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mm-work__strip" ref={stripRef}>
        {work.map((item) => (
          <WorkCard key={item.id} item={item} wasDragged={wasDragged} />
        ))}
      </div>
    </section>
  );
}
