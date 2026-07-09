import { z } from 'zod'

/** "YYYY", "YYYY-MM", or "YYYY-MM-DD" */
const dateString = z.string().regex(/^\d{4}(-\d{2})?(-\d{2})?$/)

export const certificationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  issuer: z.string().min(1),
  year: z.number().int().optional(),
  url: z.string().url().optional(),
  credentialId: z.string().optional(),
})

export const usesCategorySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  items: z
    .array(
      z.object({
        name: z.string().min(1),
        note: z.string().optional(),
        url: z.string().url().optional(),
      }),
    )
    .min(1),
})

export const nowSchema = z.object({
  /** "YYYY-MM-DD" — shown as "Last updated" on /now */
  updatedAt: dateString,
  /** Optional free-form paragraph above the derived focus list */
  note: z.string().optional(),
})

export const changelogTagSchema = z.enum(['added', 'changed', 'fixed', 'milestone'])

export const changelogEntrySchema = z.object({
  date: dateString,
  title: z.string().min(1),
  description: z.string().optional(),
  tag: changelogTagSchema.default('added'),
})

/** Timeline-only events that belong to no other module */
export const milestoneSchema = z.object({
  id: z.string().min(1),
  date: dateString,
  title: z.string().min(1),
  description: z.string().optional(),
})

export const openSourceContributionSchema = z.object({
  id: z.string().min(1),
  project: z.string().min(1),
  description: z.string().min(1),
  url: z.string().url(),
  role: z.string().optional(),
  year: z.number().int().optional(),
})

export const readingStatusSchema = z.enum(['reading', 'read', 'want-to-read'])

export const readingItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  author: z.string().min(1),
  url: z.string().url().optional(),
  status: readingStatusSchema,
  note: z.string().optional(),
  finishedAt: dateString.optional(),
})

export const speakingEngagementSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  event: z.string().min(1),
  date: dateString,
  url: z.string().url().optional(),
  description: z.string().optional(),
})

export const resumeVersionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  /** Path under /public, e.g. /resume/abdul-rehman.pdf */
  url: z.string().startsWith('/'),
  note: z.string().optional(),
})

export const resumeSchema = z.object({
  updatedAt: dateString.optional(),
  versions: z.array(resumeVersionSchema).default([]),
})

export type Certification = z.infer<typeof certificationSchema>
export type UsesCategory = z.infer<typeof usesCategorySchema>
export type Now = z.infer<typeof nowSchema>
export type ChangelogEntry = z.infer<typeof changelogEntrySchema>
export type ChangelogTag = z.infer<typeof changelogTagSchema>
export type Milestone = z.infer<typeof milestoneSchema>
export type OpenSourceContribution = z.infer<typeof openSourceContributionSchema>
export type ReadingItem = z.infer<typeof readingItemSchema>
export type ReadingStatus = z.infer<typeof readingStatusSchema>
export type SpeakingEngagement = z.infer<typeof speakingEngagementSchema>
export type ResumeVersion = z.infer<typeof resumeVersionSchema>
export type Resume = z.infer<typeof resumeSchema>
