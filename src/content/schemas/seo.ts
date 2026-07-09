import { z } from 'zod'

export const siteSeoSchema = z.object({
  /** Canonical production origin, no trailing slash */
  url: z.string().url(),
  siteName: z.string().min(1),
  /** `%s` is replaced with the page title */
  titleTemplate: z.string().includes('%s'),
  defaultTitle: z.string().min(1),
  defaultDescription: z.string().min(1).max(200),
  /** Path under /public used when a page provides no own image */
  defaultOgImage: z.string().startsWith('/'),
  twitterHandle: z.string().startsWith('@').optional(),
  locale: z.string().default('en_US'),
})

export type SiteSeo = z.infer<typeof siteSeoSchema>
