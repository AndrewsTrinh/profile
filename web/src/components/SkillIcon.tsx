import type { CSSProperties } from 'react';
import type { SkillId } from '../data/resume';
import { skillLabel } from '../lib/skills';

// Skills with a real logo PNG (copied into public/logos/).
const LOGOS: Partial<Record<SkillId, string>> = {
  python: 'python.png',
  sql: 'sql.png',
  r: 'r.png',
  powerbi: 'powerbi.png',
  etl: 'spark.png',
};

// 16x16 pixel-art glyphs (rows of bits) for the skills without an official logo.
const PIXELS: Partial<Record<SkillId, number[][]>> = {
  // bar chart
  stats: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 1, 0, 1, 0],
    [0, 1, 0, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 1, 0, 1, 0],
    [0, 1, 0, 1, 1, 0, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ],
  // brain / chip
  ml: [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [1, 0, 1, 1, 1, 0, 0, 1],
    [1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 1, 1, 1, 0, 1],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
  ],
  // sparkle / star
  genai: [
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 0, 0, 1],
    [0, 1, 1, 0, 1, 1, 0, 0],
    [0, 1, 0, 0, 0, 1, 0, 0],
  ],
  // speech bubble
  nlp: [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
  ],
};

export default function SkillIcon({
  id,
  size = 24,
  color = 'var(--gold)',
}: {
  id: SkillId;
  size?: number;
  color?: string;
}) {
  const label = skillLabel(id);
  const logo = LOGOS[id];

  if (logo) {
    return (
      <img
        src={`${import.meta.env.BASE_URL}logos/${logo}`}
        alt={label}
        title={label}
        width={size}
        height={size}
        style={{ imageRendering: 'pixelated', objectFit: 'contain', display: 'block' }}
      />
    );
  }

  const grid = PIXELS[id];
  if (!grid) return null;

  const style: CSSProperties = { display: 'block', imageRendering: 'pixelated' };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 8 8"
      role="img"
      aria-label={label}
      style={style}
    >
      <title>{label}</title>
      {grid.flatMap((row, y) =>
        row.map((on, x) =>
          on ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={color} /> : null,
        ),
      )}
    </svg>
  );
}
