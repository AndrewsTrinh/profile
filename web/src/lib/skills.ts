import { focusSkills, type SkillId, type TimelineItem } from '../data/resume';

const ORDER = focusSkills.map((s) => s.id);
const LABEL = new Map<SkillId, string>(focusSkills.map((s) => [s.id, s.label]));

export const skillLabel = (id: SkillId) => LABEL.get(id) ?? id;

// Union of all skills tagged on an item's achievements, in canonical focusSkills order.
export function itemSkills(item: TimelineItem): SkillId[] {
  const set = new Set<SkillId>();
  for (const a of item.achievements) for (const s of a.skills) set.add(s);
  return ORDER.filter((id) => set.has(id));
}

// Format 'YYYY-MM' | 'present' -> 'Mon YYYY' | 'Present'
export const formatDate = (d: string) =>
  d === 'present'
    ? 'Present'
    : new Date(d + '-01').toLocaleDateString('en-AU', { month: 'short', year: 'numeric' });
