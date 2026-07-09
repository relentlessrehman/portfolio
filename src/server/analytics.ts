import { createServerFn } from '@tanstack/react-start'
import { isSupabaseConfigured } from './env'
import { getPublicSupabaseClient } from './supabase'

export interface PageEventInput {
  path: string
  referrer?: string
}

/**
 * Cookie-less by design: no client-side identifier is generated or stored
 * (no cookie, no localStorage id, no fingerprint) — just a path, an optional
 * referrer, and a server-assigned timestamp. No-ops silently when Supabase
 * isn't configured, so analytics can never break the page for a visitor.
 */
export const logPageEvent = createServerFn({ method: 'POST' })
  .validator((input: PageEventInput) => input)
  .handler(async ({ data }) => {
    if (!isSupabaseConfigured()) return { ok: false as const }
    const supabase = getPublicSupabaseClient()
    if (!supabase) return { ok: false as const }
    const { error } = await supabase.from('page_events').insert({
      path: data.path,
      referrer: data.referrer || null,
    })
    return { ok: !error }
  })
