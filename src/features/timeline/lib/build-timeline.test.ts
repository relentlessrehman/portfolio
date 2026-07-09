import { describe, expect, it } from 'vitest'
import { content } from '#/content'
import { buildTimeline, timelineByYear } from './build-timeline'

describe('buildTimeline', () => {
  const events = buildTimeline()

  it('sorts newest first', () => {
    for (let i = 1; i < events.length; i++) {
      expect(events[i - 1].date.localeCompare(events[i].date)).toBeGreaterThanOrEqual(0)
    }
  })

  it('gives every event a non-empty id, title, date, and category', () => {
    for (const event of events) {
      expect(event.id).not.toBe('')
      expect(event.title).not.toBe('')
      expect(event.date).toMatch(/^\d{4}(-\d{2})?(-\d{2})?$/)
      expect(event.category).not.toBe('')
    }
  })

  it('has unique ids', () => {
    const ids = events.map((event) => event.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('includes the coding-since milestone', () => {
    const first = events.find((event) => event.id === 'first-code')
    expect(first?.date).toBe(String(content.profile.codingSince))
  })

  it('includes both a start and a shipped event for a production project with a publish date', () => {
    const shipped = content.projects.find(
      (project) => ['production', 'maintained'].includes(project.status) && project.publishedAt,
    )
    if (!shipped) return
    expect(events.some((event) => event.id === `proj-${shipped.slug}`)).toBe(true)
    expect(events.some((event) => event.id === `proj-${shipped.slug}-shipped`)).toBe(true)
  })

  it('never includes an unpublished experience entry', () => {
    const unpublished = content.experience.filter((entry) => !entry.published)
    for (const entry of unpublished) {
      expect(events.some((event) => event.id === `exp-${entry.id}`)).toBe(false)
    }
  })
})

describe('timelineByYear', () => {
  it('accounts for every event exactly once', () => {
    const groups = timelineByYear()
    const total = groups.reduce((sum, group) => sum + group.events.length, 0)
    expect(total).toBe(buildTimeline().length)
  })

  it('orders years newest first', () => {
    const years = timelineByYear().map((group) => group.year)
    const sorted = [...years].sort((a, b) => b.localeCompare(a))
    expect(years).toEqual(sorted)
  })
})
