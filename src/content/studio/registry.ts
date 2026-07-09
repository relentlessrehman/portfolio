/*
 * Studio collection registry — the map between a content type, its JSON
 * file, its Zod schema (used to validate before every write), and how a
 * "feed" list should render each entry as a card. Shared by the Studio UI
 * (client) and the Studio server functions (src/server/studio.ts); it has
 * no filesystem access itself, so it's safe to import from either side.
 */
import { z } from 'zod'
import { profileSchema } from '../schemas/profile'
import { socialLinkSchema } from '../schemas/social'
import { siteSeoSchema } from '../schemas/seo'
import { educationSchema } from '../schemas/education'
import { skillSchema, learningTopicsSchema } from '../schemas/skill'
import { experienceSchema } from '../schemas/experience'
import { achievementSchema } from '../schemas/achievement'
import { projectSchema } from '../schemas/project'
import {
  certificationSchema,
  changelogEntrySchema,
  milestoneSchema,
  nowSchema,
  openSourceContributionSchema,
  readingItemSchema,
  resumeSchema,
  speakingEngagementSchema,
  usesCategorySchema,
} from '../schemas/misc'

export interface CollectionEntry {
  kind: 'list' | 'singleton'
  file: string
  label: string
  description: string
  schema: z.ZodType
  /** List-view card title */
  itemLabel?: (item: any) => string
  /** List-view card subtitle */
  itemSubtitle?: (item: any) => string | undefined
  /** Starter object for "+ New" */
  blank?: () => unknown
}

export const collectionRegistry = {
  profile: {
    kind: 'singleton',
    file: 'profile.json',
    label: 'Profile',
    description: 'Name, bio, mission, values, focus, availability.',
    schema: profileSchema,
  },
  socials: {
    kind: 'list',
    file: 'socials.json',
    label: 'Socials',
    description: 'Links shown on the hero, footer, and contact.',
    schema: z.array(socialLinkSchema),
    itemLabel: (item) => item.label,
    itemSubtitle: (item) => item.url,
    blank: () => ({ platform: 'website', label: '', url: '', featured: false }),
  },
  seo: {
    kind: 'singleton',
    file: 'seo.json',
    label: 'SEO',
    description: 'Site title, description, and default social image.',
    schema: siteSeoSchema,
  },
  education: {
    kind: 'list',
    file: 'education.json',
    label: 'Education',
    description: 'Schools, degrees, and periods.',
    schema: z.array(educationSchema),
    itemLabel: (item) => item.degree,
    itemSubtitle: (item) => item.institution,
    blank: () => ({
      id: '',
      institution: '',
      degree: '',
      period: { end: new Date().getFullYear(), expected: false },
      highlights: [],
    }),
  },
  skills: {
    kind: 'singleton',
    file: 'skills.json',
    label: 'Skills',
    description: 'Skills by category, plus topics you’re learning.',
    schema: z.object({ skills: z.array(skillSchema), learningTopics: learningTopicsSchema }),
  },
  experience: {
    kind: 'list',
    file: 'experience.json',
    label: 'Experience',
    description: 'Roles, founding work, and internships.',
    schema: z.array(experienceSchema),
    itemLabel: (item) => item.role,
    itemSubtitle: (item) => item.organization,
    blank: () => ({
      id: '',
      role: '',
      organization: '',
      type: 'job',
      start: String(new Date().getFullYear()),
      summary: '',
      highlights: [],
      techStack: [],
      published: true,
    }),
  },
  achievements: {
    kind: 'list',
    file: 'achievements.json',
    label: 'Achievements',
    description: 'Awards, results, and recognitions.',
    schema: z.array(achievementSchema),
    itemLabel: (item) => item.title,
    itemSubtitle: (item) => (item.year ? String(item.year) : undefined),
    blank: () => ({ id: '', title: '' }),
  },
  projects: {
    kind: 'list',
    file: 'projects.json',
    label: 'Projects',
    description: 'Engineering case studies — the centerpiece of the site.',
    schema: z.array(projectSchema),
    itemLabel: (item) => item.name,
    itemSubtitle: (item) => item.tagline,
    blank: () => ({
      slug: '',
      name: '',
      tagline: '',
      summary: '',
      status: 'building',
      featured: false,
      role: '',
      timeline: { start: String(new Date().getFullYear()) },
      techStack: [],
      links: {},
      caseStudy: {},
      gallery: [],
    }),
  },
  certifications: {
    kind: 'list',
    file: 'certifications.json',
    label: 'Certifications',
    description: 'Empty is fine — hidden from nav and search until filled.',
    schema: z.array(certificationSchema),
    itemLabel: (item) => item.name,
    itemSubtitle: (item) => item.issuer,
    blank: () => ({ id: '', name: '', issuer: '' }),
  },
  uses: {
    kind: 'list',
    file: 'uses.json',
    label: 'Uses',
    description: 'Tools, stack, and daily kit, grouped into categories.',
    schema: z.array(usesCategorySchema),
    itemLabel: (item) => item.title,
    itemSubtitle: (item) => `${item.items?.length ?? 0} item${item.items?.length === 1 ? '' : 's'}`,
    blank: () => ({ id: '', title: '', items: [{ name: '' }] }),
  },
  now: {
    kind: 'singleton',
    file: 'now.json',
    label: 'Now',
    description: 'What you’re focused on right now, and when it was last true.',
    schema: nowSchema,
  },
  changelog: {
    kind: 'list',
    file: 'changelog.json',
    label: 'Changelog',
    description: 'Site history, newest first.',
    schema: z.array(changelogEntrySchema),
    itemLabel: (item) => item.title,
    itemSubtitle: (item) => item.date,
    blank: () => ({
      date: new Date().toISOString().slice(0, 10),
      title: '',
      tag: 'added',
    }),
  },
  milestones: {
    kind: 'list',
    file: 'milestones.json',
    label: 'Milestones',
    description: 'Timeline-only events — hackathons, offers, and moments.',
    schema: z.array(milestoneSchema),
    itemLabel: (item) => item.title,
    itemSubtitle: (item) => item.date,
    blank: () => ({ id: '', date: new Date().toISOString().slice(0, 10), title: '' }),
  },
  openSource: {
    kind: 'list',
    file: 'open-source.json',
    label: 'Open Source',
    description: 'Contributions to other projects — hidden from nav until filled.',
    schema: z.array(openSourceContributionSchema),
    itemLabel: (item) => item.project,
    itemSubtitle: (item) => item.description,
    blank: () => ({ id: '', project: '', description: '', url: '' }),
  },
  reading: {
    kind: 'list',
    file: 'reading.json',
    label: 'Reading',
    description: 'Books and long-form pieces — hidden from nav until filled.',
    schema: z.array(readingItemSchema),
    itemLabel: (item) => item.title,
    itemSubtitle: (item) => item.author,
    blank: () => ({ id: '', title: '', author: '', status: 'reading' }),
  },
  speaking: {
    kind: 'list',
    file: 'speaking.json',
    label: 'Speaking',
    description: 'Talks and events — hidden from nav until filled.',
    schema: z.array(speakingEngagementSchema),
    itemLabel: (item) => item.title,
    itemSubtitle: (item) => item.event,
    blank: () => ({
      id: '',
      title: '',
      event: '',
      date: new Date().toISOString().slice(0, 10),
    }),
  },
  resume: {
    kind: 'singleton',
    file: 'resume.json',
    label: 'Resume',
    description: 'PDF versions — drop the file in /public/resume first.',
    schema: resumeSchema,
  },
} as const satisfies Record<string, CollectionEntry>

export type CollectionKey = keyof typeof collectionRegistry

export function isCollectionKey(key: string): key is CollectionKey {
  return key in collectionRegistry
}
