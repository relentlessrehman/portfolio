/*
 * Reads optional backend configuration from the environment. Every value is
 * optional by design: without them, the contact form and analytics degrade
 * to a "not configured" response instead of crashing the site, and the
 * private dashboard (Phase 9) reports itself unavailable.
 */

/*
 * The URL and anon key are intentionally read from VITE_-prefixed vars:
 * the anon key is safe to expose (RLS governs what it can do), and the
 * dashboard's client-side magic-link sign-in needs the same values in the
 * browser. The service-role key below is never VITE_-prefixed and never
 * reaches the client bundle.
 */
export function getSupabaseUrl(): string | undefined {
  return import.meta.env.VITE_SUPABASE_URL || undefined
}

export function getSupabaseAnonKey(): string | undefined {
  return import.meta.env.VITE_SUPABASE_ANON_KEY || undefined
}

export function getSupabaseServiceRoleKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || undefined
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey())
}

export function isDashboardConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseServiceRoleKey() && getDashboardAllowedEmail())
}

export function getDashboardAllowedEmail(): string | undefined {
  return process.env.DASHBOARD_ALLOWED_EMAIL || undefined
}

export function getResendApiKey(): string | undefined {
  return process.env.RESEND_API_KEY || undefined
}

export function getContactNotifyEmail(): string | undefined {
  return process.env.CONTACT_NOTIFY_EMAIL || undefined
}

export function isResendConfigured(): boolean {
  return Boolean(getResendApiKey() && getContactNotifyEmail())
}
