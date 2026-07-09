import { z } from 'zod'
import { imageSchema } from './profile'

export const projectStatusSchema = z.enum([
  'idea',
  'planning',
  'building',
  'testing',
  'production',
  'maintained',
  'archived',
])

export const projectDifficultySchema = z.enum(['beginner', 'intermediate', 'advanced'])

/** "YYYY", "YYYY-MM", or "YYYY-MM-DD" */
const dateString = z.string().regex(/^\d{4}(-\d{2})?(-\d{2})?$/)

const galleryImageSchema = imageSchema.extend({
  /** Shown under the image in the lightbox; falls back to alt */
  caption: z.string().optional(),
})

/* ── Project lifecycle stages (optional per-project timeline) ───────── */

export const projectStageSchema = z.object({
  stage: z.enum(['idea', 'planning', 'development', 'testing', 'deployment', 'maintenance']),
  date: dateString.optional(),
  note: z.string().optional(),
  state: z.enum(['completed', 'current', 'upcoming']).default('completed'),
})

/* ── Structured case-study items (plain strings stay valid) ─────────── */

export const challengeSchema = z.object({
  challenge: z.string().min(1),
  whyItMattered: z.string().optional(),
  solution: z.string().optional(),
  outcome: z.string().optional(),
})

export const tradeoffOptionSchema = z.object({
  name: z.string().min(1),
  pros: z.array(z.string().min(1)).default([]),
  cons: z.array(z.string().min(1)).default([]),
  chosen: z.boolean().default(false),
})

export const tradeoffSchema = z.object({
  /** What was being decided, e.g. "Database" */
  decision: z.string().min(1),
  options: z.array(tradeoffOptionSchema).min(1),
  /** Why the chosen option won */
  reason: z.string().optional(),
})

export const roadmapStatusSchema = z.enum(['planned', 'in-progress', 'future', 'completed'])

export const roadmapItemSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: roadmapStatusSchema.default('planned'),
})

/* ── Architecture visualization — one field, four render modes ──────── */

export const architectureSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('image'), image: imageSchema }),
  z.object({ type: z.literal('mermaid'), code: z.string().min(1) }),
  z.object({
    type: z.literal('graph'),
    nodes: z.array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
        /** Grid coordinates, 0-based; layout is (x * column, y * row) */
        x: z.number().int().min(0),
        y: z.number().int().min(0),
      }),
    ),
    edges: z.array(
      z.object({
        from: z.string().min(1),
        to: z.string().min(1),
        label: z.string().optional(),
      }),
    ),
  }),
  z.object({ type: z.literal('placeholder') }),
])

/* ── Structured engineering metrics — render automatically if present ─ */

const count = z.number().int().min(0)
const score = z.number().min(0).max(100)

export const engineeringMetricsSchema = z.object({
  commits: count.optional(),
  features: count.optional(),
  pages: count.optional(),
  apiRoutes: count.optional(),
  databaseTables: count.optional(),
  users: count.optional(),
  performanceScore: score.optional(),
  lighthouseScore: score.optional(),
})

/* ── The project ────────────────────────────────────────────────────── */

const paragraphs = z.array(z.string().min(1))

export const projectSchema = z
  .object({
    /** Defaults to the slug — provide only if they must differ */
    id: z.string().min(1).optional(),
    slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'kebab-case slug'),
    name: z.string().min(1),
    /** One line under the name, e.g. "Hostel discovery for students" */
    tagline: z.string().min(1),
    /** 2–3 sentences for cards and meta descriptions */
    summary: z.string().min(1),
    status: projectStatusSchema,
    featured: z.boolean().default(false),
    /** Lower numbers appear first among featured projects */
    featuredOrder: z.number().int().optional(),
    /** Free-form grouping, e.g. "web-app", "startup", "ai" */
    categories: z.array(z.string().min(1)).default([]),
    difficulty: projectDifficultySchema.optional(),
    role: z.string().min(1),
    teamSize: z.number().int().positive().default(1),
    timeline: z.object({
      start: dateString,
      end: dateString.optional(),
    }),
    /** Optional lifecycle stages — renders the project timeline section */
    stages: z.array(projectStageSchema).default([]),
    version: z.string().optional(),
    /** First publication of this case study (JSON-LD datePublished) */
    publishedAt: dateString.optional(),
    /** Last substantive update (rendered + JSON-LD dateModified) */
    updatedAt: dateString.optional(),
    /**
     * Names must match skill names in content/skills.ts — search-by-technology
     * and skill evidence both join on these strings.
     */
    techStack: z.array(z.string().min(1)).min(1),
    links: z
      .object({
        live: z.string().url().optional(),
        github: z.string().url().optional(),
      })
      .default({}),
    /** Free-form metrics beyond the structured engineering ones */
    metrics: z
      .array(z.object({ label: z.string().min(1), value: z.string().min(1) }))
      .default([]),
    engineering: engineeringMetricsSchema.optional(),
    architecture: architectureSchema.optional(),
    /**
     * The engineering case study. Sections are optional so a project can be
     * published early and deepened over time; the detail page renders only
     * what exists (and derives its TOC from it). Challenges, tradeoffs, and
     * future improvements accept plain strings or structured objects.
     */
    caseStudy: z
      .object({
        overview: paragraphs.optional(),
        problem: paragraphs.optional(),
        research: paragraphs.optional(),
        planning: paragraphs.optional(),
        architecture: paragraphs.optional(),
        database: paragraphs.optional(),
        implementation: paragraphs.optional(),
        challenges: z.array(z.union([z.string().min(1), challengeSchema])).optional(),
        tradeoffs: z.array(z.union([z.string().min(1), tradeoffSchema])).optional(),
        lessons: paragraphs.optional(),
        futureImprovements: z
          .array(z.union([z.string().min(1), roadmapItemSchema]))
          .optional(),
      })
      .optional(),
    /** Per-project SEO overrides; sensible values are derived when absent */
    seo: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
        keywords: z.array(z.string().min(1)).optional(),
      })
      .optional(),
    /** Manual related-project override; computed from tech overlap when absent */
    relatedSlugs: z.array(z.string().min(1)).optional(),
    favicon: imageSchema.optional(),
    cover: imageSchema.optional(),
    gallery: z.array(galleryImageSchema).default([]),
  })
  .transform((project) => ({ ...project, id: project.id ?? project.slug }))

export type Project = z.infer<typeof projectSchema>
/** Shape content authors write — defaulted/derived fields are optional */
export type ProjectInput = z.input<typeof projectSchema>
export type ProjectStatus = z.infer<typeof projectStatusSchema>
export type ProjectStage = z.infer<typeof projectStageSchema>
export type Challenge = z.infer<typeof challengeSchema>
export type Tradeoff = z.infer<typeof tradeoffSchema>
export type RoadmapItem = z.infer<typeof roadmapItemSchema>
export type RoadmapStatus = z.infer<typeof roadmapStatusSchema>
export type Architecture = z.infer<typeof architectureSchema>
export type EngineeringMetrics = z.infer<typeof engineeringMetricsSchema>
export type GalleryImage = z.infer<typeof galleryImageSchema>
