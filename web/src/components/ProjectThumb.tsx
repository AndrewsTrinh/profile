import type { Project } from '../data/resume';

const ACCENT_VAR: Record<Project['accent'], string> = {
  coral: 'var(--coral)',
  mint: 'var(--mint)',
  blue: 'var(--blue)',
  gold: 'var(--gold)',
  teal: 'var(--teal)',
};

// 8x8 pixel-art motifs (1 = filled).
const GLYPHS: Record<Project['glyph'], number[][]> = {
  // sparkle / generative
  sparkle: [
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 0, 0, 1],
    [0, 1, 1, 0, 1, 1, 0, 0],
    [0, 1, 0, 0, 0, 1, 0, 0],
  ],
  // document / paper
  paper: [
    [1, 1, 1, 1, 1, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 1, 0],
    [1, 0, 1, 1, 0, 1, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 0, 1, 1, 1, 0, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 0, 1, 1, 1, 0, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
  ],
  // network graph (nodes + edges)
  graph: [
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [0, 1, 1, 0, 0, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 0, 0, 1, 1, 0],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
  ],
};

export default function ProjectThumb({ project }: { project: Project }) {
  const accent = ACCENT_VAR[project.accent];

  if (project.image) {
    return (
      <img
        src={`${import.meta.env.BASE_URL}projects/${project.image}`}
        alt={project.name}
        className="aspect-video w-full"
        style={{ imageRendering: 'pixelated', objectFit: 'cover', display: 'block' }}
      />
    );
  }

  const grid = GLYPHS[project.glyph];
  return (
    <div
      className="relative aspect-video w-full overflow-hidden"
      style={{
        background: 'var(--panel)',
        // low-opacity pixel-dot pattern
        backgroundImage:
          'repeating-linear-gradient(0deg, rgba(241,238,226,0.06) 0 1px, transparent 1px 8px), repeating-linear-gradient(90deg, rgba(241,238,226,0.06) 0 1px, transparent 1px 8px)',
        borderBottom: `3px solid ${accent}`,
      }}
      aria-hidden
    >
      <svg
        viewBox="0 0 8 8"
        className="absolute left-1/2 top-1/2 h-1/2 w-auto -translate-x-1/2 -translate-y-1/2"
        style={{ imageRendering: 'pixelated', aspectRatio: '1 / 1' }}
      >
        {grid.flatMap((row, y) =>
          row.map((on, x) =>
            on ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={accent} /> : null,
          ),
        )}
      </svg>
    </div>
  );
}
