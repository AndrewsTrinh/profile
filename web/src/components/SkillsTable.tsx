import { useState } from 'react';
import skills from '../data/skills.generated.json';
import type { SkillId } from '../data/resume';
import SkillIcon from './SkillIcon';
import { highlightMetrics } from '../lib/highlight';

interface SkillAchievement {
  text: string;
  org: string;
  period: string;
}
interface SkillRow {
  id: string;
  skill: string;
  kind: 'language' | 'skill';
  since: number | null;
  years: number;
  achievements: SkillAchievement[];
}

const rows = skills as SkillRow[];
const maxYears = Math.max(...rows.map((r) => r.years), 1);
const COLS = 5;

function PixelBar({ years }: { years: number }) {
  return (
    <span className="pixel-bar" role="img" aria-label={`${years} years`}>
      {Array.from({ length: maxYears }, (_, i) => (
        <span
          key={i}
          className="pixel-cell"
          style={{ background: i < years ? 'var(--gold)' : 'rgba(241,238,226,0.12)' }}
        />
      ))}
    </span>
  );
}

export default function SkillsTable() {
  const [open, setOpen] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const allOpen = open.size === rows.length;
  const toggleAll = () => setOpen(allOpen ? new Set() : new Set(rows.map((r) => r.id)));

  return (
    <section className="mx-auto max-w-5xl px-4 py-8" aria-labelledby="skills-h">
      <h2
        id="skills-h"
        className="mb-2 text-mint"
        style={{ fontFamily: 'var(--font-pixel)', fontSize: 16 }}
      >
        SKILLS · HIGH SCORES
      </h2>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-cream/70" style={{ fontSize: 18 }}>
          Years of experience counted from the first role where each skill was used. Click a row to
          reveal its achievements.
        </p>
        <button
          type="button"
          className="pixel-btn"
          onClick={toggleAll}
          aria-pressed={allOpen}
        >
          {allOpen ? '▾ COLLAPSE ALL' : '▸ EXPAND ALL'}
        </button>
      </div>

      <div className="pixel-panel overflow-x-auto p-4">
        <table className="w-full border-collapse" style={{ fontSize: 20 }}>
          <thead>
            <tr className="text-gold" style={{ fontFamily: 'var(--font-pixel)', fontSize: 10 }}>
              <th className="w-8 px-2 py-2" aria-hidden />
              <th className="px-2 py-2 text-left">SKILL</th>
              <th className="px-2 py-2 text-left">TYPE</th>
              <th className="px-2 py-2 text-left">SINCE</th>
              <th className="px-2 py-2 text-left">YEARS</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const isOpen = open.has(r.id);
              const panelId = `ach-${r.id}`;
              return (
                <FragmentRows
                  key={r.id}
                  row={r}
                  isOpen={isOpen}
                  panelId={panelId}
                  onToggle={() => toggle(r.id)}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function FragmentRows({
  row,
  isOpen,
  panelId,
  onToggle,
}: {
  row: SkillRow;
  isOpen: boolean;
  panelId: string;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        className="cursor-pointer border-t border-cream/10 hover:bg-cream/5"
        onClick={onToggle}
      >
        <td className="px-2 py-2 align-middle">
          <button
            type="button"
            aria-expanded={isOpen}
            aria-controls={panelId}
            aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${row.skill} achievements`}
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="text-mint"
            style={{ fontFamily: 'var(--font-pixel)', fontSize: 12, lineHeight: 1 }}
          >
            {isOpen ? '▾' : '▸'}
          </button>
        </td>
        <td className="px-2 py-2 text-cream">
          <span className="flex items-center gap-2">
            <SkillIcon id={row.id as SkillId} size={22} />
            {row.skill}
          </span>
        </td>
        <td className="px-2 py-2">
          <span
            className="pixel-badge"
            style={{ color: row.kind === 'language' ? 'var(--mint)' : 'var(--teal)' }}
          >
            {row.kind === 'language' ? 'LANG' : 'SKILL'}
          </span>
        </td>
        <td className="px-2 py-2 text-cream">{row.since ?? '—'}</td>
        <td className="px-2 py-2">
          <div className="flex items-center gap-3">
            <PixelBar years={row.years} />
            <span className="text-gold" style={{ fontSize: 22 }}>
              {row.years}y
            </span>
          </div>
        </td>
      </tr>
      {isOpen && (
        <tr id={panelId}>
          <td />
          <td colSpan={COLS - 1} className="px-2 pb-4">
            <ul className="space-y-2 border-l-2 border-gold/60 pl-3">
              {row.achievements.map((a, i) => (
                <li key={i} style={{ fontSize: 18, lineHeight: 1.6 }}>
                  <span className="text-gold" style={{ fontSize: 14 }}>
                    {a.org} · {a.period}
                  </span>
                  <br />
                  <span className="text-cream">{highlightMetrics(a.text)}</span>
                </li>
              ))}
            </ul>
          </td>
        </tr>
      )}
    </>
  );
}
