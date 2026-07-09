import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseAuthConfigured = Boolean(url && anonKey)

/** Browser-only client for the dashboard's magic-link sign-in. */
export const supabaseBrowser = isSupabaseAuthConfigured ? createClient(url!, anonKey!) : undefined
