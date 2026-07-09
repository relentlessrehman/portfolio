/*
 * Content registry — the only sanctioned way to read content.
 *
 * Every module is validated with its Zod schema at module-evaluation time,
 * which happens during the build: invalid content fails the build with a
 * precise error instead of shipping a broken page.
 */
import { z } from 'zod'

import { profile as profileData } from './profile'
import { socials as socialsData } from './socials'
import { siteSeo as siteSeoData } from './seo'
import { education as educationData } from './education'
import { skills as skillsData, learningTopics as learningTopicsData } from './skills'
import { experience as experienceData } from './experience'
import { achievements as achievementsData } from './achievements'
import { projects as projectsData } from './projects'
import { certifications as certificationsData } from './certifications'
import { uses as usesData } from './uses'
import { now as nowData } from './now'
import { changelog as changelogData } from './changelog'
import { milestones as milestonesData } from './milestones'
import { openSource as openSourceData } from './open-source'
import { reading as readingData } from './reading'
import { speaking as speakingData } from './speaking'
import { resume as resumeData } from './resume'

import { profileSchema } from './schemas/profile'
import { socialLinkSchema } from './schemas/social'
import { siteSeoSchema } from './schemas/seo'
import { educationSchema } from './schemas/education'
import { skillSchema, learningTopicsSchema } from './schemas/skill'
import { experienceSchema } from './schemas/experience'
import { achievementSchema } from './schemas/achievement'
import { projectSchema } from './schemas/project'
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
} from './schemas/misc'

function validate<Schema extends z.ZodType>(
  moduleName: string,
  schema: Schema,
  data: unknown,
): z.infer<Schema> {
  const result = schema.safeParse(data)
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  • ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n')
    throw new Error(`Invalid content in src/content/${moduleName}:\n${issues}`)
  }
  return result.data
}

export const content = {
  profile: validate('profile.ts', profileSchema, profileData),
  socials: validate('socials.ts', z.array(socialLinkSchema), socialsData),
  seo: validate('seo.ts', siteSeoSchema, siteSeoData),
  education: validate('education.ts', z.array(educationSchema), educationData),
  skills: validate('skills.ts', z.array(skillSchema), skillsData),
  learningTopics: validate('skills.ts#learningTopics', learningTopicsSchema, learningTopicsData),
  experience: validate('experience.ts', z.array(experienceSchema), experienceData),
  achievements: validate('achievements.ts', z.array(achievementSchema), achievementsData),
  projects: validate('projects.ts', z.array(projectSchema), projectsData),
  certifications: validate('certifications.ts', z.array(certificationSchema), certificationsData),
  uses: validate('uses.ts', z.array(usesCategorySchema), usesData),
  now: validate('now.ts', nowSchema, nowData),
  changelog: validate('changelog.ts', z.array(changelogEntrySchema), changelogData).sort(
    (a, b) => b.date.localeCompare(a.date),
  ),
  milestones: validate('milestones.ts', z.array(milestoneSchema), milestonesData),
  openSource: validate(
    'open-source.ts',
    z.array(openSourceContributionSchema),
    openSourceData,
  ),
  reading: validate('reading.ts', z.array(readingItemSchema), readingData),
  speaking: validate('speaking.ts', z.array(speakingEngagementSchema), speakingData).sort(
    (a, b) => b.date.localeCompare(a.date),
  ),
  resume: validate('resume.ts', resumeSchema, resumeData),
} as const

/* ── Derived accessors — one source of truth, computed views ────────── */

export const featuredSocials = content.socials.filter((link) => link.featured)

export const publishedExperience = content.experience.filter((entry) => entry.published)

export const featuredProjects = content.projects
  .filter((project) => project.featured)
  .sort((a, b) => (a.featuredOrder ?? Infinity) - (b.featuredOrder ?? Infinity))

// Referential integrity: manual related-project overrides must point at real slugs
{
  const slugs = new Set(content.projects.map((project) => project.slug))
  for (const project of content.projects) {
    for (const related of project.relatedSlugs ?? []) {
      if (!slugs.has(related)) {
        throw new Error(
          `Invalid content in src/content/projects.ts: "${project.slug}" lists unknown related slug "${related}"`,
        )
      }
    }
  }
}

export const shippedProjectCount = content.projects.filter((project) =>
  ['production', 'maintained'].includes(project.status),
).length

/** Whole years since Abdul started programming, minimum 1 */
export function yearsCoding(now = new Date()): number {
  return Math.max(1, now.getFullYear() - content.profile.codingSince)
}

/** Projects whose techStack includes the given skill name (exact match) */
export function projectsUsingSkill(skillName: string) {
  return content.projects.filter((project) => project.techStack.includes(skillName))
}

export function projectBySlug(slug: string) {
  return content.projects.find((project) => project.slug === slug)
}

/**
 * Related projects: the manual `relatedSlugs` override wins when present;
 * otherwise ranked automatically by tech-stack overlap.
 */
export function relatedProjects(slug: string, limit = 2) {
  const source = projectBySlug(slug)
  if (!source) return []
  if (source.relatedSlugs) {
    return source.relatedSlugs
      .map((relatedSlug) => projectBySlug(relatedSlug))
      .filter((project) => project !== undefined)
      .slice(0, limit)
  }
  return content.projects
    .filter((project) => project.slug !== slug)
    .map((project) => ({
      project,
      overlap: project.techStack.filter((tech) => source.techStack.includes(tech)).length,
    }))
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, limit)
    .map((entry) => entry.project)
}

/** Every technology used across projects — drives the projects filter UI */
export const allProjectTechnologies = [
  ...new Set(content.projects.flatMap((project) => project.techStack)),
].sort((a, b) => a.localeCompare(b))

export type Content = typeof content
