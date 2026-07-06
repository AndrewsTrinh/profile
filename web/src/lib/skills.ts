// Format 'YYYY-MM' | 'present' -> 'Mon YYYY' | 'Present'
export const formatDate = (d: string) =>
  d === 'present'
    ? 'Present'
    : new Date(d + '-01').toLocaleDateString('en-AU', { month: 'short', year: 'numeric' });
