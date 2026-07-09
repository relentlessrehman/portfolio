import { createClient } from '@supabase/supabase-js'
import {
  getSupabaseAnonKey,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from './env'
import type { SupabaseClient } from '@supabase/supabase-js'

let publicClient: SupabaseClient | undefined
let adminClient: SupabaseClient | undefined

/**
 * Anonymous-role client for public writes (contact form, analytics).
 * RLS on both tables permits INSERT only — see supabase/schema.sql.
 */
export function getPublicSupabaseClient(): SupabaseClient | undefined {
  if (!isSupabaseConfigured()) return undefined
  if (!publicClient) {
    try {
      publicClient = createClient(getSupabaseUrl()!, getSupabaseAnonKey()!, {
        auth: { persistSession: false },
      })
    } catch {
      return undefined
    }
  }
  return publicClient
}

/**
 * Service-role client that bypasses RLS — server-only, used exclusively by
 * the authenticated dashboard (Phase 9). Never import this from client code.
 */
export function getAdminSupabaseClient(): SupabaseClient | undefined {
  const url = getSupabaseUrl()
  const serviceRoleKey = getSupabaseServiceRoleKey()
  if (!url || !serviceRoleKey) return undefined
  if (!adminClient) {
    try {
      adminClient = createClient(url, serviceRoleKey, {
        auth: { persistSession: false },
      })
    } catch {
      return undefined
    }
  }
  return adminClient
}
