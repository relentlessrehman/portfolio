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

export const primaryNav: Array<NavItem> = [
  { label: 'Home', href: '/' },
  { label: 'Projects', href: '/projects' },
  { label: 'Writing', href: '/writing' },
  { label: 'About', href: '/about' },
]

export const exploreNav: Array<NavItem> = [
  ...when(content.skills.length > 0, { label: 'Skills', href: '/skills' }),
  ...when(content.experience.some((entry) => entry.published), {
    label: 'Experience',
    href: '/experience',
  }),
  { label: 'Timeline', href: '/timeline' },
  ...when(content.achievements.length > 0, { label: 'Achievements', href: '/achievements' }),
]

/**
 * Mobile bottom bar (thumb-reach navigation). Icons resolve in
 * components/layout/BottomNav.tsx.
 */
export interface MobileNavItem extends NavItem {
  icon: 'home' | 'projects' | 'skills' | 'user' | 'contact'
  /** Match the route exactly for the active state (used by "/") */
  exact?: boolean
}

export const mobileNav: Array<MobileNavItem> = [
  { label: 'Home', href: '/', icon: 'home', exact: true },
  { label: 'Projects', href: '/projects', icon: 'projects' },
  { label: 'About', href: '/about', icon: 'user' },
  { label: 'Skills', href: '/skills', icon: 'skills' },
  { label: 'Contact', href: '/#contact', icon: 'contact' },
]

/** Footer link groups — entries appear only when their content exists */
export interface FooterGroup {
  title: string
  items: Array<NavItem>
}

function when(condition: boolean, item: NavItem): Array<NavItem> {
  return condition ? [item] : []
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
    title: 'Meta',
    items: [
      { label: 'Now', href: '/now' },
      ...when(content.uses.length > 0, { label: 'Uses', href: '/uses' }),
      ...when(content.reading.length > 0, { label: 'Reading', href: '/reading' }),
      ...when(content.changelog.length > 0, { label: 'Changelog', href: '/changelog' }),
      { label: 'RSS', href: '/rss.xml' },
    ],
  },
]
