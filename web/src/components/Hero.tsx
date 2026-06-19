import { profile } from '../data/resume';

export default function Hero() {
  return (
    <header className="mx-auto max-w-5xl px-4 pt-10 pb-6">
      <p className="mb-3 text-mint" style={{ fontFamily: 'var(--font-pixel)', fontSize: 10 }}>
        ► PLAYER 1
      </p>
      <h1
        className="text-mint"
        style={{ fontFamily: 'var(--font-pixel)', fontSize: 'clamp(18px, 4vw, 34px)' }}
      >
        {profile.name}
      </h1>
      <p className="mt-3 text-coral" style={{ fontSize: 26 }}>
        {profile.title}
      </p>

      <nav className="mt-5 flex flex-wrap gap-3" aria-label="Contact">
        <a className="pixel-btn" href={`tel:${profile.phone.replace(/\s/g, '')}`}>
          ☎ {profile.phone}
        </a>
        <a className="pixel-btn" href={`mailto:${profile.email}`}>
          ✉ {profile.email}
        </a>
        <a className="pixel-btn" href={profile.linkedinUrl} target="_blank" rel="noreferrer">
          in/{profile.linkedinLabel}
        </a>
      </nav>

      <section className="pixel-panel mt-7 p-5">
        <h2 className="mb-3 text-gold" style={{ fontFamily: 'var(--font-pixel)', fontSize: 12 }}>
          SUMMARY
        </h2>
        <p style={{ fontSize: 24, lineHeight: 1.7 }}>{profile.summary}</p>
      </section>
    </header>
  );
}
