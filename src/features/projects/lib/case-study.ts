import type {
  Challenge,
  Project,
  RoadmapItem,
  Tradeoff,
} from '#/content/schemas/project'

/**
 * A section body is typed by kind so the page can pick the right renderer
 * (paragraphs, challenge cards, tradeoff comparisons, insight cards,
 * roadmap cards) without the page knowing schema details.
 */
export type SectionBody =
  | { kind: 'paragraphs'; paragraphs: Array<string> }
  | { kind: 'challenges'; items: Array<string | Challenge> }
  | { kind: 'tradeoffs'; items: Array<string | Tradeoff> }
  | { kind: 'lessons'; items: Array<string> }
  | { kind: 'roadmap'; items: Array<string | RoadmapItem> }

export interface CaseStudySection {
  /** Anchor id */
  id: string
  title: string
  body: SectionBody
}

type CaseStudy = NonNullable<Project['caseStudy']>

/** Canonical section order + titles + renderer kinds */
const sectionOrder = [
  ['overview', 'Overview', 'paragraphs'],
  ['problem', 'Problem', 'paragraphs'],
  ['research', 'Research', 'paragraphs'],
  ['planning', 'Planning', 'paragraphs'],
  ['architecture', 'Architecture', 'paragraphs'],
  ['database', 'Database', 'paragraphs'],
  ['implementation', 'Implementation', 'paragraphs'],
  ['challenges', 'Challenges', 'challenges'],
  ['tradeoffs', 'Tradeoffs', 'tradeoffs'],
  ['lessons', 'Lessons', 'lessons'],
  ['futureImprovements', 'Future improvements', 'roadmap'],
] as const satisfies ReadonlyArray<readonly [keyof CaseStudy, string, SectionBody['kind']]>

/** Sections that exist on this project, in canonical order — drives body + TOC */
export function caseStudySections(project: Project): Array<CaseStudySection> {
  const caseStudy = project.caseStudy
  if (!caseStudy) return []

  return sectionOrder.flatMap(([id, title, kind]) => {
    const value = caseStudy[id]
    if (!value || value.length === 0) return []
    // The schema guarantees value's shape matches the declared kind
    const body =
      kind === 'paragraphs'
        ? ({ kind, paragraphs: value as Array<string> } as const)
        : ({ kind, items: value } as SectionBody)
    return [{ id, title, body }]
  })
}

function textOf(value: unknown): string {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.map(textOf).join(' ')
  if (value && typeof value === 'object') return Object.values(value).map(textOf).join(' ')
  return ''
}

export function wordCount(project: Project): number {
  return [project.summary, textOf(project.caseStudy ?? {})]
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length
}

const WORDS_PER_MINUTE = 200

/** Estimated reading time in whole minutes, minimum 1 */
export function readingTimeMinutes(project: Project): number {
  return Math.max(1, Math.ceil(wordCount(project) / WORDS_PER_MINUTE))
}

export function formatTimeline(timeline: Project['timeline']): string {
  const start = timeline.start.slice(0, 4)
  const end = timeline.end ? timeline.end.slice(0, 4) : 'Present'
  return start === end ? start : `${start} — ${end}`
}

function toMonths(date: string, fallbackMonth: number): number {
  const [year, month] = date.split('-').map(Number)
  return year * 12 + ((month || fallbackMonth) - 1)
}

/** Human development time, e.g. "4 mo" or "1 yr 3 mo" — ongoing counts to now */
export function formatDuration(timeline: Project['timeline'], now = new Date()): string {
  const start = toMonths(timeline.start, 1)
  const end = timeline.end
    ? toMonths(timeline.end, 12)
    : now.getFullYear() * 12 + now.getMonth()
  const total = Math.max(1, end - start + 1)
  const years = Math.floor(total / 12)
  const months = total % 12
  const parts = [years > 0 ? `${years} yr` : null, months > 0 ? `${months} mo` : null]
  const label = parts.filter(Boolean).join(' ')
  return timeline.end ? label : `${label} · ongoing`
}

/** "YYYY-MM" → "Jul 2026", "YYYY" → "2026" */
export function formatDate(date: string): string {
  const [year, month] = date.split('-')
  if (!month) return year
  const name = new Date(Number(year), Number(month) - 1).toLocaleString('en', {
    month: 'short',
  })
  return `${name} ${year}`
}
