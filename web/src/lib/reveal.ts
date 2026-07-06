import { useEffect } from 'react';

// Fade/slide-in `.reveal` elements as they scroll into view (ported from the
// reference design's app.js). No-op when the user prefers reduced motion —
// the CSS also forces `.reveal` visible in that case.
export function useScrollReveal() {
  useEffect(() => {
    const items = document.querySelectorAll('.reveal');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}
