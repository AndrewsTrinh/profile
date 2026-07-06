import { profile } from '../data/resume';

export default function Hero() {
  return (
    <section className="hero" id="top">
      <p className="eyebrow">{profile.eyebrow}</p>
      <h1 className="hero__name">{profile.heroName}</h1>
      <p className="hero__tagline">
        <span>{profile.tagline}</span>
        <span className="cursor" aria-hidden="true">
          _
        </span>
      </p>
      <div className="hero__actions">
        <a className="pixel-btn pixel-btn--solid" href="#work">
          VIEW WORK
        </a>
        <a className="pixel-btn pixel-btn--ghost" href={`${import.meta.env.BASE_URL}resume.pdf`} download>
          RESUME ↓
        </a>
      </div>
    </section>
  );
}
