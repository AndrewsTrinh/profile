import { projects, type Project } from '../data/resume';
import ProjectThumb from './ProjectThumb';

const ACCENT_VAR: Record<Project['accent'], string> = {
  coral: 'var(--coral)',
  mint: 'var(--mint)',
  blue: 'var(--blue)',
  gold: 'var(--gold)',
  teal: 'var(--teal)',
};

function Card({ project }: { project: Project }) {
  const accent = ACCENT_VAR[project.accent];
  const cta = project.glyph === 'paper' ? 'READ PAPER ↗' : 'VIEW PROJECT ↗';

  const inner = (
    <>
      <ProjectThumb project={project} />
      <div className="p-4">
        <h3 className="text-cream" style={{ fontFamily: 'var(--font-pixel)', fontSize: 12, lineHeight: 1.5 }}>
          {project.name}
        </h3>
        <p className="mt-3 text-cream/80" style={{ fontSize: 19, lineHeight: 1.6 }}>
          {project.description}
        </p>
        {project.url && (
          <span
            className="mt-3 inline-block pixel-badge"
            style={{ color: accent }}
          >
            {cta}
          </span>
        )}
      </div>
    </>
  );

  const baseClass = 'pixel-panel block h-full';
  const style = { borderColor: accent };

  return project.url ? (
    <a
      href={project.url}
      target="_blank"
      rel="noreferrer"
      className={`${baseClass} transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5`}
      style={style}
    >
      {inner}
    </a>
  ) : (
    <div className={baseClass} style={style}>
      {inner}
    </div>
  );
}

export default function ProjectGallery() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-8" aria-labelledby="projects-h">
      <h2
        id="projects-h"
        className="mb-2 text-mint"
        style={{ fontFamily: 'var(--font-pixel)', fontSize: 16 }}
      >
        PROJECTS
      </h2>
      <p className="mb-4 text-cream/70" style={{ fontSize: 18 }}>
        Selected builds and research. Click a card to open it.
      </p>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <Card key={p.id} project={p} />
        ))}
      </div>
    </section>
  );
}
