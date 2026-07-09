import { content, projectsUsingSkill } from '#/content'
import { posts } from '#/features/writing/lib/posts'
import { footerGroups } from '#/config/nav'

export type SearchEntryType = 'page' | 'project' | 'post' | 'skill'

export interface SearchEntry {
  id: string
  type: SearchEntryType
  title: string
  subtitle?: string
  href: string
  /** Extra fuzzy-matchable text (tags, tech stack, category) — not shown, just searched */
  keywords: Array<string>
}

/**
 * The palette's page list reuses footerGroups, which already hides pages
 * with no content (SPEC-REVIEW.md §3) — one gating rule, not two.
 */
function pageEntries(): Array<SearchEntry> {
  const fromFooter = footerGroups
    .flatMap((group) => group.items)
    .filter((item) => item.href.startsWith('/') && !item.href.includes('.'))
    .map((item) => ({
      id: `page-${item.href}`,
      type: 'page' as const,
      title: item.label,
      href: item.href,
      keywords: [],
    }))
  return [
    { id: 'page-home', type: 'page', title: 'Home', href: '/', keywords: [] },
    ...fromFooter,
  ]
}

function projectEntries(): Array<SearchEntry> {
  return content.projects.map((project) => ({
    id: `project-${project.slug}`,
    type: 'project',
    title: project.name,
    subtitle: project.tagline,
    href: `/projects/${project.slug}`,
    keywords: [project.summary, ...project.techStack, ...project.categories],
  }))
}

function postEntries(): Array<SearchEntry> {
  return posts.map((post) => ({
    id: `post-${post.slug}`,
    type: 'post',
    title: post.title,
    subtitle: post.description,
    href: `/writing/${post.slug}`,
    keywords: [post.description, ...post.tags],
  }))
}

/** Technology-aware: searching a skill surfaces the projects that prove it */
function skillEntries(): Array<SearchEntry> {
  return content.skills.map((skill) => {
    const usedIn = projectsUsingSkill(skill.name)
    return {
      id: `skill-${skill.name}`,
      type: 'skill' as const,
      title: skill.name,
      subtitle: usedIn.length > 0 ? `Used in ${usedIn.map((p) => p.name).join(', ')}` : skill.category,
      href: usedIn.length === 1 ? `/projects/${usedIn[0].slug}` : '/skills',
      keywords: [skill.category],
    }
  })
}

/**
 * Order matters beyond grouping: with no query, the palette shows the first
 * few entries as-is, so real content (projects, writing) leads and static
 * pages fill the rest.
 */
export function buildSearchIndex(): Array<SearchEntry> {
  return [...projectEntries(), ...postEntries(), ...pageEntries(), ...skillEntries()]
}
