// Turns "2026-11-14" into "14 Nov 2026".
// The parts are passed separately so the date isn't shifted by the time zone.
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
