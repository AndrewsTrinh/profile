import { profile } from '@/lib/resume-data';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  return (
    <header className="border-b border-ctp-surface0 bg-ctp-mantle px-6 py-6 sm:px-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-ctp-mauve bg-ctp-surface0 text-xl font-bold text-ctp-mauve">
              {profile.initials}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-ctp-mauve">
                Candidate Interview Bot
              </p>
              <h1 className="text-2xl font-bold text-ctp-text">{profile.heroName}</h1>
              <p className="text-sm text-ctp-subtext1">{profile.title}</p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-ctp-green/40 bg-ctp-green/10 px-3 py-1 text-xs font-medium text-ctp-green">
            <span className="h-1.5 w-1.5 rounded-full bg-ctp-green" /> Open to work
          </span>
          <a
            href={`mailto:${profile.email}`}
            className="rounded-full border border-ctp-surface1 bg-ctp-surface0 px-3 py-1.5 text-xs font-medium text-ctp-text transition-colors hover:border-ctp-mauve hover:text-ctp-mauve"
          >
            ✉ Email
          </a>
          <a
            href={profile.linkedinUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-ctp-mauve px-3 py-1.5 text-xs font-semibold text-ctp-crust transition-opacity hover:opacity-90"
          >
            in {profile.linkedinLabel}
          </a>
        </div>
      </div>
    </header>
  );
}
