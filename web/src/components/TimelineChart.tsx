import { useState } from 'react';
import { CURRENT_YEAR, timeline, type TimelineItem } from '../data/resume';
import TimelineItemCard from './TimelineItemCard';

const MIN_YEAR = 2018;
const MAX_YEAR = CURRENT_YEAR;
const RANGE = MAX_YEAR - MIN_YEAR;

// 'YYYY-MM' | 'present' -> fractional year
const frac = (d: string) => {
  if (d === 'present') return MAX_YEAR;
  const y = Number(d.slice(0, 4));
  const m = Number(d.slice(5, 7) || '1');
  return y + (m - 1) / 12;
};

const pct = (year: number) => ((year - MIN_YEAR) / RANGE) * 100;

// segmented-pixel bar surface
const segments = (color: string) =>
  `repeating-linear-gradient(90deg, ${color} 0px, ${color} 9px, rgba(0,0,0,0.45) 9px, rgba(0,0,0,0.45) 11px)`;

const years = Array.from({ length: RANGE + 1 }, (_, i) => MIN_YEAR + i);

function Row({
  item,
  active,
  onActivate,
  onClear,
}: {
  item: TimelineItem;
  active: boolean;
  onActivate: () => void;
  onClear: () => void;
}) {
  const color = item.type === 'experience' ? 'var(--coral)' : 'var(--blue)';
  const left = pct(frac(item.start));
  const right = pct(frac(item.end));
  const width = Math.max(right - left, 1.5); // ensure single-year items are visible
  const isPresent = item.end === 'present';

  return (
    <div
      className="relative grid items-center gap-2 py-2 md:grid-cols-[210px_1fr]"
      onMouseEnter={onActivate}
      onMouseLeave={onClear}
    >
      <div className="text-cream" style={{ fontSize: 18, lineHeight: 1.2 }}>
        <span className="text-gold">{item.org}</span>
      </div>

      <div className="relative h-7">
        {/* vertical year gridlines */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, rgba(10,10,10,0.14) 0px, rgba(10,10,10,0.14) 1px, transparent 1px, transparent calc(100%/${RANGE}))`,
          }}
        />
        <button
          type="button"
          onFocus={onActivate}
          onBlur={onClear}
          aria-label={`${item.role} at ${item.org}. Show achievements.`}
          aria-expanded={active}
          className="absolute top-0 h-7 cursor-pointer"
          style={{
            left: `${left}%`,
            width: `${width}%`,
            minWidth: 22,
            background: segments(color),
            border: `2px solid ${active ? 'var(--mint)' : 'var(--cream)'}`,
            boxShadow: active ? '0 0 0 2px var(--mint)' : 'none',
          }}
        >
          {isPresent && (
            <span
              className="absolute -right-4 top-1/2 -translate-y-1/2 text-mint"
              style={{ fontSize: 16 }}
              aria-hidden
            >
              ▶
            </span>
          )}
        </button>
      </div>

      {active && (
        <div className="absolute left-0 right-0 top-full z-20 md:left-[210px]">
          <TimelineItemCard item={item} />
        </div>
      )}
    </div>
  );
}

export default function TimelineChart() {
  const [activeId, setActiveId] = useState<string | null>(null);
  // newest first reads naturally top-to-bottom
  const items = [...timeline]
    .reverse()
    .filter((item) => Number(item.start.slice(0, 4)) >= MIN_YEAR);

  return (
    <section className="mx-auto max-w-5xl px-4 py-8" aria-labelledby="timeline-h">
      <h2
        id="timeline-h"
        className="mb-2 text-mint"
        style={{ fontFamily: 'var(--font-pixel)', fontSize: 16 }}
      >
        TIMELINE
      </h2>
      <p className="mb-4 text-cream/70" style={{ fontSize: 18 }}>
        Hover or focus a bar to reveal achievements.
      </p>

      <div className="mb-3 flex gap-4" style={{ fontSize: 16 }}>
        <span className="flex items-center gap-2">
          <span style={{ width: 16, height: 12, background: 'var(--coral)', display: 'inline-block', border: '1px solid var(--cream)' }} />
          Experience
        </span>
        <span className="flex items-center gap-2">
          <span style={{ width: 16, height: 12, background: 'var(--blue)', display: 'inline-block', border: '1px solid var(--cream)' }} />
          Education
        </span>
      </div>

      <div className="pixel-panel p-4">
        {/* year axis */}
        <div className="mb-2 hidden md:grid md:grid-cols-[210px_1fr]">
          <div />
          <div className="flex justify-between text-cream/70" style={{ fontSize: 14 }}>
            {years.map((y) => (
              <span key={y}>{`'${String(y).slice(2)}`}</span>
            ))}
          </div>
        </div>

        <div className="divide-y divide-cream/10">
          {items.map((item) => (
            <Row
              key={item.id}
              item={item}
              active={activeId === item.id}
              onActivate={() => setActiveId(item.id)}
              onClear={() => setActiveId((cur) => (cur === item.id ? null : cur))}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
