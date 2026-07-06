import { credentials, timeline } from '../data/resume';
import { highlightMetrics } from '../lib/highlight';
import { formatDate } from '../lib/skills';

const experience = timeline.filter((t) => t.type === 'experience').reverse(); // newest first
const education = timeline.filter((t) => t.type === 'education').reverse();

export default function Experience() {
  return (
    <section className="section section--cream section--tight" id="experience">
      <p className="eyebrow eyebrow--dark">03 · EXPERIENCE</p>
      <div className="timeline">
        {experience.map((item) => (
          <div className="tl reveal" key={item.id}>
            <div className="tl__rail" aria-hidden="true">
              <span className="tl__node" />
              <span className="tl__line" />
            </div>
            <div>
              <div className="tl__period">
                {`${formatDate(item.start)} — ${formatDate(item.end)}`.toUpperCase()}
              </div>
              <div className="tl__role">{item.role}</div>
              <div className="tl__org">
                {item.org}
                {item.orgNote ? ` · ${item.orgNote}` : ''}
              </div>
              <ul className="tl__bullets">
                {item.achievements
                  .filter((a) => a.highlight)
                  .map((a) => (
                    <li key={a.text}>{highlightMetrics(a.text)}</li>
                  ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <p className="eyebrow eyebrow--dark eyebrow--spaced">04 · EDUCATION</p>
      <div className="education">
        {education.map((item) => (
          <div className="edu reveal" key={item.id}>
            <div className="edu__title">{item.role}</div>
            <div className="edu__org">{item.org}</div>
          </div>
        ))}
        {credentials.map((c) => (
          <div className="edu reveal" key={c.title}>
            <div className="edu__title">{c.title}</div>
            <div className="edu__org">{c.org}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
