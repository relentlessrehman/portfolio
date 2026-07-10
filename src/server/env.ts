/*
 * Reads optional backend configuration from the environment. Every value is
 * optional by design: without them, the contact form and analytics degrade
 * to a "not configured" response instead of crashing the site, and the
 * private dashboard (Phase 9) reports itself unavailable.
 */

/*
 * The URL and anon key are intentionally read from VITE_-prefixed vars: the
 * anon key is safe to expose (RLS governs what it can do) and is used by the
 * contact form / analytics inserts. The service-role key below is never
 * VITE_-prefixed and never reaches the client bundle.
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
  return Boolean(
    getSupabaseUrl() &&
      getSupabaseServiceRoleKey() &&
      getDashboardPassword() &&
      getDashboardSessionSecret() &&
      getDashboardSecurityQuestion(1) &&
      getDashboardSecurityAnswer(1) &&
      getDashboardSecurityQuestion(2) &&
      getDashboardSecurityAnswer(2),
  )
}

/** The password typed into the /dashboard sign-in form. Single-user, no email involved. */
export function getDashboardPassword(): string | undefined {
  return process.env.DASHBOARD_PASSWORD || undefined
}

/**
 * Private key used to seal the dashboard's session cookie (TanStack Start's
 * useSession). Must be at least 32 characters — unrelated to
 * DASHBOARD_PASSWORD, generate with e.g. `openssl rand -hex 32`.
 */
export function getDashboardSessionSecret(): string | undefined {
  return process.env.DASHBOARD_SESSION_SECRET || undefined
}

/**
 * Two extra security questions required alongside the password. Question
 * text is sent to the client so the sign-in form can display it; answers
 * never leave the server.
 */
export function getDashboardSecurityQuestion(index: 1 | 2): string | undefined {
  return process.env[`DASHBOARD_SECURITY_QUESTION_${index}`] || undefined
}

export function getDashboardSecurityAnswer(index: 1 | 2): string | undefined {
  return process.env[`DASHBOARD_SECURITY_ANSWER_${index}`] || undefined
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
