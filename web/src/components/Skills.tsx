import skills from '../data/skills.generated.json';

const MAX_BLOCKS = 10;

// Block bars driven by the extractor's computed years-of-experience:
// filled blocks = years (capped at 10), label = "N YRS".
export default function Skills() {
  return (
    <section className="section section--navy" id="skills">
      <p className="eyebrow">01 · SKILLS</p>
      <div className="skills">
        {skills.map((s) => {
          const filled = Math.max(0, Math.min(MAX_BLOCKS, s.years));
          return (
            <div className="skill reveal" key={s.id}>
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
            </div>
          );
        })}
      </div>
    </section>
  );
}
