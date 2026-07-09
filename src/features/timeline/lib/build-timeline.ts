import { content, publishedExperience } from '#/content'

export type TimelineCategory =
  | 'education'
  | 'experience'
  | 'project'
  | 'achievement'
  | 'certification'
  | 'milestone'

export interface TimelineEvent {
  id: string
  /** Sortable: "YYYY" or "YYYY-MM" */
  date: string
  title: string
  subtitle?: string
  description?: string
  category: TimelineCategory
  /** Internal link for events with their own page */
  href?: string
}

/**
 * The unified timeline is 100% derived — education, experience, projects,
 * achievements, certifications, and manual milestones merge into one
 * stream. Nothing here is hand-maintained (SPEC-REVIEW.md §4).
 */
export function buildTimeline(): Array<TimelineEvent> {
  const events: Array<TimelineEvent> = []

  events.push({
    id: 'first-code',
    date: String(content.profile.codingSince),
    title: 'Wrote my first lines of code',
    category: 'milestone',
  })

  for (const entry of content.education) {
    events.push({
      id: `edu-${entry.id}`,
      date: String(entry.period.start ?? entry.period.end),
      title: entry.period.start ? `Started ${entry.degree}` : `Completed ${entry.degree}`,
      subtitle: entry.school ? `${entry.institution} · ${entry.school}` : entry.institution,
      description: entry.summary,
      category: 'education',
      href: '/education',
    })
  }

  for (const entry of publishedExperience) {
    events.push({
      id: `exp-${entry.id}`,
      date: entry.start,
      title:
        entry.type === 'founder'
          ? `Founded ${entry.organization}`
          : `${entry.role} at ${entry.organization}`,
      subtitle: entry.type === 'founder' ? entry.role : undefined,
      description: entry.summary,
      category: 'experience',
      href: '/experience',
    })
  }

  for (const project of content.projects) {
    events.push({
      id: `proj-${project.slug}`,
      date: project.timeline.start,
      title: `Started building ${project.name}`,
      subtitle: project.tagline,
      category: 'project',
      href: `/projects/${project.slug}`,
    })
    if (['production', 'maintained'].includes(project.status) && project.publishedAt) {
      events.push({
        id: `proj-${project.slug}-shipped`,
        date: project.publishedAt,
        title: `Shipped ${project.name} to production`,
        subtitle: project.links.live?.replace(/^https?:\/\/(www\.)?/, ''),
        category: 'project',
        href: `/projects/${project.slug}`,
      })
    }
  }

  for (const achievement of content.achievements) {
    if (!achievement.year) continue
    events.push({
      id: `ach-${achievement.id}`,
      date: String(achievement.year),
      title: achievement.title,
      description: achievement.description,
      category: 'achievement',
      href: '/achievements',
    })
  }

  for (const certification of content.certifications) {
    if (!certification.year) continue
    events.push({
      id: `cert-${certification.id}`,
      date: String(certification.year),
      title: certification.name,
      subtitle: certification.issuer,
      category: 'certification',
      href: '/certifications',
    })
  }

  for (const milestone of content.milestones) {
    events.push({
      id: `mile-${milestone.id}`,
      date: milestone.date,
      title: milestone.title,
      description: milestone.description,
      category: 'milestone',
    })
  }

  // Newest first; within a year, month-precise dates sort after year-only ones
  return events.sort((a, b) => b.date.localeCompare(a.date))
}

/** Events grouped by year, newest year first — drives the /timeline layout */
export function timelineByYear(): Array<{ year: string; events: Array<TimelineEvent> }> {
  const groups = new Map<string, Array<TimelineEvent>>()
  for (const event of buildTimeline()) {
    const year = event.date.slice(0, 4)
    const group = groups.get(year) ?? []
    group.push(event)
    groups.set(year, group)
  }
  return [...groups.entries()].map(([year, events]) => ({ year, events }))
}
