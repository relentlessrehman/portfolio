import { z } from 'zod'

export const contactFormSchema = z.object({
  name: z.string().min(2, 'Enter your name.').max(120),
  email: z.string().email('Enter a valid email.'),
  message: z.string().min(10, 'Say a little more — at least 10 characters.').max(4000),
  /** Honeypot — real visitors never fill this in; bots usually do */
  company: z.string().max(0, 'Spam check failed.').optional(),
})

export type ContactFormValues = z.infer<typeof contactFormSchema>
