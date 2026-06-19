// Extracts the skills table from the structured resume data.
//
//   years of experience = CURRENT_YEAR - (earliest start year of any item using the skill)
//
// Prints a table to the terminal AND writes src/data/skills.generated.json for the dashboard.
// The JSON also carries the achievements related to each skill (with company + period) so the
// SkillsTable can show them in an expandable dropdown.
//
// Run: `npm run extract` (also runs automatically on `npm run build`).

import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { CURRENT_YEAR, focusSkills, timeline } from '../src/data/resume.ts';
import { formatDate } from '../src/lib/skills.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));

const yearOf = (d: string) => Number(d.slice(0, 4));

interface SkillAchievement {
  text: string;
  org: string;
  period: string;
}

export interface SkillRow {
  id: string;
  skill: string;
  kind: 'language' | 'skill';
  since: number | null;
  years: number;
  achievements: SkillAchievement[];
}

// newest-first so the most recent work shows first in each dropdown
const itemsNewestFirst = [...timeline].reverse();

const rows: SkillRow[] = focusSkills.map((meta) => {
  const startYears: number[] = [];
  const achievements: SkillAchievement[] = [];

  for (const item of itemsNewestFirst) {
    let used = false;
    for (const a of item.achievements) {
      if (a.skills.includes(meta.id)) {
        used = true;
        achievements.push({
          text: a.text,
          org: item.org,
          period: `${formatDate(item.start)} – ${formatDate(item.end)}`,
        });
      }
    }
    if (used) startYears.push(yearOf(item.start));
  }

  const since = startYears.length ? Math.min(...startYears) : null;
  const years = since === null ? 0 : CURRENT_YEAR - since;
  return { id: meta.id, skill: meta.label, kind: meta.kind, since, years, achievements };
});

// Sort by experience (desc), then alphabetically.
rows.sort((a, b) => b.years - a.years || a.skill.localeCompare(b.skill));

// --- Tabular output for the terminal ---
console.table(
  rows.map((r) => ({
    Skill: r.skill,
    Type: r.kind === 'language' ? 'Language' : 'Skill',
    Since: r.since ?? '—',
    'Years of experience': r.years,
    Achievements: r.achievements.length,
  })),
);

// --- Persist for the dashboard ---
const outDir = join(__dirname, '..', 'src', 'data');
mkdirSync(outDir, { recursive: true });
const outFile = join(outDir, 'skills.generated.json');
writeFileSync(outFile, JSON.stringify(rows, null, 2) + '\n');
console.log(`\nWrote ${rows.length} skills -> ${outFile}`);
