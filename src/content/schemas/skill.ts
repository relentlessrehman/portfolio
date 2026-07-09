import { z } from 'zod'

export const skillCategorySchema = z.enum([
  'language',
  'frontend',
  'backend',
  'database',
  'tools',
  'concepts',
])

export const skillSchema = z.object({
  /**
   * Must match the spelling used in project `techStack` arrays —
   * skill evidence ("N projects use this") is derived by exact name match.
   */
  name: z.string().min(1),
  category: skillCategorySchema,
})

/** Topics under active study — honest signal, rendered separately from skills */
export const learningTopicsSchema = z.array(z.string().min(1))

export type Skill = z.infer<typeof skillSchema>
export type SkillCategory = z.infer<typeof skillCategorySchema>
