'use client';

// No React state: the inline script in layout.tsx already sets data-theme
// before paint, so visibility is pure CSS (see .theme-label-* in globals.css)
// and toggling is a plain DOM mutation — avoids a setState-in-effect and any
// hydration-mismatch risk from guessing the persisted theme during render.
function toggle() {
  const root = document.documentElement;
  const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  if (next === 'dark') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', 'light');
  }
  window.localStorage.setItem('ctp-theme', next);
}

export function ThemeToggle() {
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle light/dark theme"
      className="rounded-full border border-ctp-surface1 bg-ctp-surface0/60 px-3 py-1.5 text-xs font-medium text-ctp-subtext1 transition-colors hover:border-ctp-mauve hover:text-ctp-mauve"
    >
      <span className="theme-label-dark">☾ Mocha</span>
      <span className="theme-label-light">☀ Latte</span>
    </button>
  );
}
