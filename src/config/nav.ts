/*
 * Navigation derives from what actually exists — sections with no
 * published content stay unlisted so the site never advertises an
 * empty page (SPEC-REVIEW.md §3).
 */
import { content } from '#/content'
import { posts } from '#/features/writing/lib/posts'

export interface NavItem {
  label: string
  href: string
}

function when(condition: boolean, item: NavItem): Array<NavItem> {
  return condition ? [item] : []
}

/** Top bar (DESIGN.md §10): four destinations, the rest live in the credits */
export const primaryNav: Array<NavItem> = [
  { label: 'Work', href: '/projects' },
  { label: 'About', href: '/about' },
  ...when(posts.length > 0, { label: 'Writing', href: '/writing' }),
  { label: 'Contact', href: '/contact' },
]

/** Footer link groups — entries appear only when their content exists */
export interface FooterGroup {
  title: string
  items: Array<NavItem>
}

export const footerGroups: Array<FooterGroup> = [
  {
    title: 'Work',
    items: [
      ...when(content.projects.length > 0, { label: 'Projects', href: '/projects' }),
      ...when(posts.length > 0, { label: 'Writing', href: '/writing' }),
      ...when(content.skills.length > 0, { label: 'Skills', href: '/skills' }),
      ...when(content.openSource.length > 0, { label: 'Open Source', href: '/open-source' }),
      { label: 'Timeline', href: '/timeline' },
    ],
  },
  {
    title: 'Background',
    items: [
      { label: 'About', href: '/about' },
      ...when(content.experience.some((entry) => entry.published), {
        label: 'Experience',
        href: '/experience',
      }),
      ...when(content.education.length > 0, { label: 'Education', href: '/education' }),
      ...when(content.achievements.length > 0, { label: 'Achievements', href: '/achievements' }),
      ...when(content.certifications.length > 0, {
        label: 'Certifications',
        href: '/certifications',
      }),
      ...when(content.speaking.length > 0, { label: 'Speaking', href: '/speaking' }),
      ...when(content.resume.versions.length > 0, { label: 'Resume', href: '/resume' }),
    ],
  },
  {
    title: 'More',
    items: [
      { label: 'Contact', href: '/contact' },
      { label: 'Now', href: '/now' },
      ...when(content.uses.length > 0, { label: 'Uses', href: '/uses' }),
      ...when(content.reading.length > 0, { label: 'Reading', href: '/reading' }),
      ...when(content.changelog.length > 0, { label: 'Changelog', href: '/changelog' }),
      { label: 'RSS', href: '/rss.xml' },
    ],
  },
]
