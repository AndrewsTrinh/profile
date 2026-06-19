import type { TimelineItem } from '../data/resume';
import { formatDate, itemSkills, skillLabel } from '../lib/skills';
import { highlightMetrics } from '../lib/highlight';
import SkillIcon from './SkillIcon';

export default function TimelineItemCard({ item }: { item: TimelineItem }) {
  const accent = item.type === 'experience' ? 'var(--coral)' : 'var(--blue)';
  const skills = itemSkills(item);

  return (
    <div className="pixel-panel card-glow p-4" style={{ borderColor: accent }}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-mint" style={{ fontFamily: 'var(--font-pixel)', fontSize: 11 }}>
          {item.role}
        </h3>
        <span className="pixel-badge" style={{ color: accent }}>
          {item.type === 'experience' ? 'WORK' : 'EDU'}
        </span>
      </div>
      <p className="mt-1 text-gold" style={{ fontSize: 20 }}>
        {item.org}
        <span className="text-cream">
          {' '}
          · {formatDate(item.start)} – {formatDate(item.end)}
        </span>
      </p>
      {item.orgNote && (
        <p className="text-cream/70" style={{ fontSize: 17 }}>
          {item.orgNote}
        </p>
      )}

      {skills.length > 0 && (
        <div
          className="mt-3 flex flex-wrap items-center gap-2 border-t border-cream/15 pt-3"
          aria-label="Skills used"
        >
          {skills.map((id) => (
            <span
              key={id}
              className="flex items-center gap-1 pixel-badge"
              style={{ color: 'var(--teal)' }}
              title={skillLabel(id)}
            >
              <SkillIcon id={id} size={16} color="var(--teal)" />
              {skillLabel(id)}
            </span>
          ))}
        </div>
      )}

      <ul className="mt-3 space-y-2">
        {item.achievements.map((a, i) => (
          <li key={i} className="flex gap-2" style={{ fontSize: 19, lineHeight: 1.7 }}>
            <span style={{ color: accent }}>▸</span>
            <span>{highlightMetrics(a.text)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
