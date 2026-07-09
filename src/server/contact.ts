import { createServerFn } from '@tanstack/react-start'
import { contactFormSchema } from '#/features/contact/lib/schema'
import { isSupabaseConfigured } from './env'
import { getPublicSupabaseClient } from './supabase'
import { sendContactNotification } from './resend'

export type ContactResult =
  | { ok: true }
  | { ok: false; reason: 'not-configured' | 'spam' | 'error'; issues?: Array<string> }

export const submitContactMessage = createServerFn({ method: 'POST' })
  .validator((input: unknown) => input)
  .handler(async ({ data }): Promise<ContactResult> => {
    const parsed = contactFormSchema.safeParse(data)
    if (!parsed.success) {
      return {
        ok: false,
        reason: 'error',
        issues: parsed.error.issues.map((issue) => issue.message),
      }
    }

    // Honeypot tripped — pretend success so the bot doesn't learn anything.
    if (parsed.data.company) return { ok: true }

    if (!isSupabaseConfigured()) {
      return { ok: false, reason: 'not-configured' }
    }

    const supabase = getPublicSupabaseClient()
    if (!supabase) return { ok: false, reason: 'not-configured' }

    const { name, email, message } = parsed.data
    const { error } = await supabase.from('contact_messages').insert({ name, email, message })
    if (error) return { ok: false, reason: 'error' }

    await sendContactNotification({ name, email, message })
    return { ok: true }
  })
