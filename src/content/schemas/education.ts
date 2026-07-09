import { z } from 'zod'

export const educationSchema = z.object({
  id: z.string().min(1),
  institution: z.string().min(1),
  /** Constituent school/faculty, e.g. "SEECS" */
  school: z.string().optional(),
  /** e.g. "BS Computer Science", "FSc Pre-Engineering", "Matriculation" */
  degree: z.string().min(1),
  location: z.string().optional(),
  period: z.object({
    start: z.number().int().optional(),
    end: z.number().int(),
    /** true while the end year is an expected graduation date */
    expected: z.boolean().default(false),
  }),
  summary: z.string().optional(),
  highlights: z.array(z.string().min(1)).default([]),
})

export type Education = z.infer<typeof educationSchema>
