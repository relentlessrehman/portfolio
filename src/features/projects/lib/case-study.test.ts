import { describe, expect, it } from 'vitest'
import { projectSchema } from '#/content/schemas/project'
import {
  caseStudySections,
  formatDate,
  formatDuration,
  formatTimeline,
  readingTimeMinutes,
  wordCount,
} from './case-study'
import type { ProjectInput } from '#/content/schemas/project'

/** Test-only fixture exercising every structured case-study feature */
const fixtureInput: ProjectInput = {
  slug: 'fixture',
  name: 'Fixture',
  tagline: 'A test project',
  summary: 'One two three four five.',
  status: 'production',
  role: 'Engineer',
  timeline: { start: '2025-03', end: '2025-08' },
  techStack: ['React'],
  caseStudy: {
    problem: ['The problem paragraph.'],
    challenges: [
      'A plain-string challenge.',
      {
        challenge: 'Structured challenge',
        whyItMattered: 'Stakes',
        solution: 'Fix',
        outcome: 'Result',
      },
    ],
    tradeoffs: [
      {
        decision: 'Database',
        options: [
          { name: 'Supabase', pros: ['Managed'], cons: ['Coupling'], chosen: true },
          { name: 'Self-hosted', pros: ['Control'], cons: ['Ops'] },
        ],
        reason: 'Speed to production.',
      },
    ],
    lessons: ['Ship early.'],
    futureImprovements: ['Plain roadmap item', { title: 'Structured item', status: 'in-progress' }],
  },
}

const fixture = projectSchema.parse(fixtureInput)

describe('projectSchema', () => {
  it('defaults id to slug', () => {
    expect(fixture.id).toBe('fixture')
  })

  it('keeps an explicit id', () => {
    expect(projectSchema.parse({ ...fixtureInput, id: 'custom' }).id).toBe('custom')
  })

  it('applies defaults for optional collections', () => {
    expect(fixture.gallery).toEqual([])
    expect(fixture.categories).toEqual([])
    expect(fixture.stages).toEqual([])
    expect(fixture.featured).toBe(false)
  })
})

describe('caseStudySections', () => {
  const sections = caseStudySections(fixture)

  it('returns only present sections in canonical order', () => {
    expect(sections.map((section) => section.id)).toEqual([
      'problem',
      'challenges',
      'tradeoffs',
      'lessons',
      'futureImprovements',
    ])
  })

  it('types each body by renderer kind', () => {
    expect(sections.map((section) => section.body.kind)).toEqual([
      'paragraphs',
      'challenges',
      'tradeoffs',
      'lessons',
      'roadmap',
    ])
  })

  it('preserves mixed string/structured items', () => {
    const challenges = sections.find((section) => section.id === 'challenges')
    expect(challenges?.body.kind).toBe('challenges')
    if (challenges?.body.kind === 'challenges') {
      expect(challenges.body.items).toHaveLength(2)
      expect(typeof challenges.body.items[0]).toBe('string')
      expect(challenges.body.items[1]).toMatchObject({ challenge: 'Structured challenge' })
    }
  })

  it('returns empty for projects without a case study', () => {
    expect(caseStudySections(projectSchema.parse({ ...fixtureInput, caseStudy: undefined }))).toEqual([])
  })
})

describe('reading stats', () => {
  it('counts words across structured content', () => {
    // Summary alone is 5 words; structured sections must contribute more
    expect(wordCount(fixture)).toBeGreaterThan(20)
  })

  it('never reports less than one minute', () => {
    expect(readingTimeMinutes(fixture)).toBe(1)
  })
})

describe('date formatting', () => {
  it('formats a bounded timeline', () => {
    expect(formatTimeline({ start: '2025-03', end: '2025-08' })).toBe('2025')
    expect(formatTimeline({ start: '2024', end: '2026' })).toBe('2024 — 2026')
  })

  it('formats duration inclusively and marks ongoing work', () => {
    expect(formatDuration({ start: '2025-03', end: '2025-08' })).toBe('6 mo')
    expect(formatDuration({ start: '2024-01', end: '2025-03' })).toBe('1 yr 3 mo')
    expect(formatDuration({ start: '2026-01' }, new Date(2026, 6, 1))).toBe('7 mo · ongoing')
  })

  it('formats dates at year and month precision', () => {
    expect(formatDate('2026')).toBe('2026')
    expect(formatDate('2026-07')).toBe('Jul 2026')
  })
})
