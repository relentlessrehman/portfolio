import { z } from 'zod'

export const socialPlatformSchema = z.enum([
  'github',
  'linkedin',
  'x',
  'email',
  'devto',
  'medium',
  'hashnode',
  'leetcode',
  'codeforces',
  'scholar',
  'orcid',
  'youtube',
  'website',
])

export const socialLinkSchema = z.object({
  platform: socialPlatformSchema,
  label: z.string().min(1),
  url: z.string().url(),
  /** e.g. "@abdulrehman" — shown next to the label where useful */
  handle: z.string().optional(),
  /** Highlighted links appear in the hero/footer; others only on Contact */
  featured: z.boolean().default(false),
})

export type SocialPlatform = z.infer<typeof socialPlatformSchema>
export type SocialLink = z.infer<typeof socialLinkSchema>
