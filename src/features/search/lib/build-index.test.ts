import { describe, expect, it } from 'vitest'
import { content } from '#/content'
import { buildSearchIndex } from './build-index'

describe('buildSearchIndex', () => {
  const entries = buildSearchIndex()

  it('gives every entry a non-empty id, title, and href', () => {
    for (const entry of entries) {
      expect(entry.id).not.toBe('')
      expect(entry.title).not.toBe('')
      expect(entry.href).toMatch(/^\//)
    }
  })

  it('has unique ids', () => {
    const ids = entries.map((entry) => entry.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('includes one entry per project and per skill', () => {
    const projectEntries = entries.filter((entry) => entry.type === 'project')
    const skillEntries = entries.filter((entry) => entry.type === 'skill')
    expect(projectEntries).toHaveLength(content.projects.length)
    expect(skillEntries).toHaveLength(content.skills.length)
  })

  it('is technology-aware: a project entry carries its tech stack as keywords', () => {
    const project = content.projects[0]
    if (!project) return
    const entry = entries.find((candidate) => candidate.id === `project-${project.slug}`)
    for (const tech of project.techStack) {
      expect(entry?.keywords).toContain(tech)
    }
  })

  it('links a skill used by exactly one project straight to that project', () => {
    for (const skill of content.skills) {
      const usedIn = content.projects.filter((project) => project.techStack.includes(skill.name))
      const entry = entries.find((candidate) => candidate.id === `skill-${skill.name}`)
      if (usedIn.length === 1) {
        expect(entry?.href).toBe(`/projects/${usedIn[0].slug}`)
      }
    }
  })
})
