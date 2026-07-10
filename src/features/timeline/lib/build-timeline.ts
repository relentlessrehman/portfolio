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
 * When two events land on the same title in the same year (e.g. an
 * achievement that just restates a founder experience), the lower-priority
 * one is dropped — see {@link dedupe}.
 */
const categoryPriority: Record<TimelineCategory, number> = {
  experience: 0,
  project: 1,
  education: 2,
  milestone: 3,
  achievement: 4,
  certification: 5,
}

/** Drops same-year, same-title repeats, keeping the highest-priority category */
function dedupe(events: Array<TimelineEvent>): Array<TimelineEvent> {
  const seen = new Map<string, TimelineEvent>()
  for (const event of events) {
    const key = `${event.date.slice(0, 4)}::${event.title.trim().toLowerCase()}`
    const existing = seen.get(key)
    if (!existing || categoryPriority[event.category] < categoryPriority[existing.category]) {
      seen.set(key, event)
    }
  }
  return [...seen.values()]
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
    title: 'Began learning software development',
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

  // Founder experiences already cover "started" for their own project — no
  // need to also say "Started building X" the same month.
  const founderOrgs = new Set(
    publishedExperience
      .filter((entry) => entry.type === 'founder')
      .map((entry) => entry.organization.toLowerCase()),
  )

  for (const project of content.projects) {
    // Small coursework/utility projects clutter the story — keep them on
    // /projects, only surface featured ones on the timeline.
    if (project.featured && !founderOrgs.has(project.name.toLowerCase())) {
      events.push({
        id: `proj-${project.slug}`,
        date: project.timeline.start,
        title: project.status === 'archived' ? `Built ${project.name}` : `Started building ${project.name}`,
        subtitle: project.tagline,
        category: 'project',
        href: `/projects/${project.slug}`,
      })
    }
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
  return dedupe(events).sort((a, b) => b.date.localeCompare(a.date))
}

function periodOf(date: string): { key: string; label: string } {
  const [year, month] = date.split('-')
  if (!month) return { key: year, label: year }
  const label = new Date(Number(year), Number(month) - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
  return { key: `${year}-${month}`, label }
}

/**
 * Events grouped by period (month where the date has one, year otherwise),
 * newest first — drives the /timeline layout.
 */
export function timelineByPeriod(): Array<{ key: string; label: string; events: Array<TimelineEvent> }> {
  const groups: Array<{ key: string; label: string; events: Array<TimelineEvent> }> = []
  for (const event of buildTimeline()) {
    const { key, label } = periodOf(event.date)
    const last = groups.at(-1)
    if (last?.key === key) {
      last.events.push(event)
    } else {
      groups.push({ key, label, events: [event] })
    }
  }
  return groups
}
