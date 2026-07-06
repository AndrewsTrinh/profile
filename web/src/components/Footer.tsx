import { CURRENT_YEAR, profile } from '../data/resume';
import { GithubIcon, LinkedinIcon, MailIcon } from './icons';

export default function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="footer__links">
        <a href={`mailto:${profile.email}`}>
          <MailIcon />
          Email
        </a>
        <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer">
          <GithubIcon />
          GitHub
        </a>
        <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer">
          <LinkedinIcon />
          LinkedIn
        </a>
      </div>
      <div className="footer__meta">
        <span className="footer__copy">
          © {CURRENT_YEAR} · {profile.name}
        </span>
        <span className="footer__pixels" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </div>
    </footer>
  );
}
