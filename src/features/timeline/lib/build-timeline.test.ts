import { describe, expect, it } from 'vitest'
import { content } from '#/content'
import { buildTimeline, timelineByPeriod } from './build-timeline'

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

  it('includes a shipped event for every production project with a publish date', () => {
    const shippedProjects = content.projects.filter(
      (project) => ['production', 'maintained'].includes(project.status) && project.publishedAt,
    )
    for (const project of shippedProjects) {
      expect(events.some((event) => event.id === `proj-${project.slug}-shipped`)).toBe(true)
    }
  })

  it('omits the "started" event for a featured project founded as its own experience', () => {
    const founderProject = content.projects.find((project) =>
      content.experience.some(
        (entry) => entry.type === 'founder' && entry.organization === project.name,
      ),
    )
    if (!founderProject) return
    expect(events.some((event) => event.id === `proj-${founderProject.slug}`)).toBe(false)
  })

  it('excludes non-featured projects from the timeline', () => {
    const minor = content.projects.filter((project) => !project.featured)
    for (const project of minor) {
      expect(events.some((event) => event.id === `proj-${project.slug}`)).toBe(false)
    }
  })

  it('never includes an unpublished experience entry', () => {
    const unpublished = content.experience.filter((entry) => !entry.published)
    for (const entry of unpublished) {
      expect(events.some((event) => event.id === `exp-${entry.id}`)).toBe(false)
    }
  })

  it('never has two events with the same title in the same year', () => {
    const keys = events.map((event) => `${event.date.slice(0, 4)}::${event.title.toLowerCase()}`)
    expect(new Set(keys).size).toBe(keys.length)
  })
})

describe('timelineByPeriod', () => {
  it('accounts for every event exactly once', () => {
    const groups = timelineByPeriod()
    const total = groups.reduce((sum, group) => sum + group.events.length, 0)
    expect(total).toBe(buildTimeline().length)
  })

  it('orders periods newest first', () => {
    const keys = timelineByPeriod().map((group) => group.key)
    const sorted = [...keys].sort((a, b) => b.localeCompare(a))
    expect(keys).toEqual(sorted)
  })
})
