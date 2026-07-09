/** "2026-07-02" → "Jul 2, 2026"; "2026-07" → "Jul 2026"; "2026" → "2026" */
export function formatDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number)
  if (!month) return String(year)
  const value = new Date(year, month - 1, day || 1)
  return value.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    ...(day ? { day: 'numeric' } : {}),
  })
}
