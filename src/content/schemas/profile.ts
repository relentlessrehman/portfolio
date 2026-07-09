import { z } from 'zod'

export const availabilityStatusSchema = z.enum([
  'open', // actively looking / accepting work
  'selective', // open to interesting opportunities
  'unavailable',
])

export const imageSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(1),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
})

export const profileSchema = z.object({
  /** Full display name, e.g. "Abdul Rehman" */
  name: z.string().min(1),
  /** Professional identity line — used in meta titles and JSON-LD jobTitle */
  role: z.string().min(1),
  /** Hero statement — one sentence about what he does, not a job title */
  headline: z.string().min(1),
  /**
   * Rotating hero subtitles. The first entry renders without JS,
   * so it must stand alone.
   */
  subtitles: z.array(z.string().min(1)).min(1),
  /** 1–2 sentence bio for cards, meta descriptions, and previews */
  shortBio: z.string().min(1).max(300),
  /** Paragraphs for the About preview and About page */
  about: z.array(z.string().min(1)).min(1),
  mission: z.string().min(1),
  motto: z.string().min(1),
  values: z.array(z.string().min(1)),
  /** What he's working on right now — feeds the Currently Building card and /now */
  currentFocus: z.array(z.string().min(1)).min(1),
  interests: z.array(z.string().min(1)),
  spokenLanguages: z.array(
    z.object({
      name: z.string().min(1),
      /** e.g. "learning", "can read" */
      note: z.string().optional(),
    }),
  ),
  location: z.string().min(1),
  hometown: z.string().optional(),
  email: z.string().email(),
  phone: z.string().min(1).optional(),
  /** Optional until a real image lands in /public — UI hides it when absent */
  portrait: imageSchema.optional(),
  availability: z.object({
    status: availabilityStatusSchema,
    /** Short pill label, e.g. "Open to internships" */
    label: z.string().min(1),
    /** The full list of what he's open to — rendered on Contact/About */
    openTo: z.array(z.string().min(1)).default([]),
  }),
  /** Year Abdul started programming — "years coding" stats derive from this */
  codingSince: z.number().int().min(1990),
})

export type Profile = z.infer<typeof profileSchema>
export type AvailabilityStatus = z.infer<typeof availabilityStatusSchema>
export type ContentImage = z.infer<typeof imageSchema>
