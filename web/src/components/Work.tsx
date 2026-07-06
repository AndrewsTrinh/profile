import { projects } from '../data/resume';
import { ExternalLinkIcon } from './icons';

export default function Work() {
  return (
    <section className="section section--cream" id="work">
      <p className="eyebrow eyebrow--dark">02 · SELECTED WORK</p>
      <h2 className="section__title">Things I've built</h2>
      <div className="projects">
        {projects.map((p) => {
          const body = (
            <>
              <div className="project__pips" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
              <div className="project__name">
                {p.name}
                {p.url && <ExternalLinkIcon />}
              </div>
              <div className="project__desc">{p.description}</div>
              <div className="project__tags">
                {p.tags.map((t) => (
                  <span className="tag" key={t}>
                    {t}
                  </span>
                ))}
              </div>
            </>
          );
          return p.url ? (
            <a className="project reveal" key={p.id} href={p.url} target="_blank" rel="noopener noreferrer">
              {body}
            </a>
          ) : (
            <div className="project reveal" key={p.id}>
              {body}
            </div>
          );
        })}
      </div>
    </section>
  );
}
