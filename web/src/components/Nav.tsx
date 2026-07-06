import { profile } from '../data/resume';

export default function Nav() {
  return (
    <header className="nav">
      <a className="logo" href="#top">
        {profile.initials}
      </a>
      <nav className="nav__links" aria-label="Primary">
        <a href="#work">work</a>
        <a href="#resume">resume</a>
        <a href="#contact">contact</a>
      </nav>
    </header>
  );
}
