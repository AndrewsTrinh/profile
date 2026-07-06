import skills from '../data/skills.generated.json';

const MAX_BLOCKS = 10;
const MAX_POP_ITEMS = 3;

// Block bars driven by the extractor's computed years-of-experience:
// filled blocks = years (capped at 10), label = "N YRS".
// Hover/focus a skill to see the resume achievements behind it (newest first).
export default function Skills() {
  return (
    <section className="section section--navy" id="skills">
      <p className="eyebrow">01 · SKILLS</p>
      <div className="skills">
        {skills.map((s) => {
          const filled = Math.max(0, Math.min(MAX_BLOCKS, s.years));
          const shown = s.achievements.slice(0, MAX_POP_ITEMS);
          const more = s.achievements.length - shown.length;
          return (
            <div className="skill reveal" key={s.id} tabIndex={0}>
              <div className="skill__name">
                <span>{s.skill}</span>
                <span className="skill__rank">{s.years} YRS</span>
              </div>
              <div
                className="skill__bar"
                role="img"
                aria-label={`${s.skill}: ${s.years} years of experience`}
              >
                {Array.from({ length: MAX_BLOCKS }, (_, i) => (
                  <i key={i} className={i < filled ? 'on' : undefined} />
                ))}
              </div>
              {shown.length > 0 && (
                <div className="skill__pop" role="tooltip">
                  <p className="skill__pop-title">RELEVANT WORK</p>
                  {shown.map((a) => (
                    <div className="skill__pop-item" key={a.text}>
                      <div className="skill__pop-org">
                        {a.org.toUpperCase()} · {a.period.toUpperCase()}
                      </div>
                      <div className="skill__pop-text">{a.text}</div>
                    </div>
                  ))}
                  {more > 0 && <p className="skill__pop-more">+{more} MORE IN THE RESUME</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
