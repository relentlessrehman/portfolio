import { z } from 'zod'

export const postFrontmatterSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1).max(300),
  /** "YYYY-MM-DD" */
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  updatedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  tags: z.array(z.string().min(1)).default([]),
  /** Drafts are excluded from lists, feeds, and search */
  draft: z.boolean().default(false),
})

export type PostFrontmatter = z.infer<typeof postFrontmatterSchema>
