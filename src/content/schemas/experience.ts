import { z } from 'zod'

export const experienceTypeSchema = z.enum([
  'founder',
  'internship',
  'job',
  'leadership',
])

export const experienceSchema = z.object({
  id: z.string().min(1),
  role: z.string().min(1),
  organization: z.string().min(1),
  organizationUrl: z.string().url().optional(),
  type: experienceTypeSchema,
  /** "YYYY" or "YYYY-MM" */
  start: z.string().regex(/^\d{4}(-\d{2})?$/),
  /** Absent = present */
  end: z.string().regex(/^\d{4}(-\d{2})?$/).optional(),
  summary: z.string().min(1),
  highlights: z.array(z.string().min(1)).default([]),
  techStack: z.array(z.string().min(1)).default([]),
  /** Unpublished entries are kept in data but never rendered */
  published: z.boolean().default(true),
})

export type Experience = z.infer<typeof experienceSchema>
export type ExperienceType = z.infer<typeof experienceTypeSchema>
