import type { ReactNode } from 'react';

// Matches metric-like tokens: 80%, 2M+, 150K+, 60–70%, 100%, 300+, 5,000+, $500M+, 8/10, 156 …
const METRIC = /(\$?\d[\d.,]*(?:[–-]\d[\d.,]*)?(?:%|K|M|B|x)?\+?(?:\/\d+)?)/gi;

// Wrap numeric/percentage tokens in a highlighted <mark> so achievement bullets
// keep their metric emphasis. `.metric` is the metrics-card class, hence `metric-token`.
export function highlightMetrics(text: string): ReactNode[] {
  return text.split(METRIC).map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="metric-token">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}
