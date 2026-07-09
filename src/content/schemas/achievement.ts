import { z } from 'zod'

export const achievementSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  year: z.number().int().optional(),
})

export type Achievement = z.infer<typeof achievementSchema>
