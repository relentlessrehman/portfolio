import { createServerFn } from '@tanstack/react-start'
import { getAdminSupabaseClient } from './supabase'
import { getDashboardAllowedEmail, isDashboardConfigured } from './env'

/**
 * Checked before the client ever calls signInWithOtp, so Supabase's magic-link
 * email is never sent to an address that couldn't get into /dashboard anyway.
 * Without this, anyone typing random emails into the sign-in form would burn
 * through Supabase's (low) email rate limit and spam real inboxes.
 */
export const isDashboardEmailAllowed = createServerFn({ method: 'POST' })
  .validator((input: { email: string }) => input)
  .handler(({ data }): boolean => {
    const allowedEmail = getDashboardAllowedEmail()
    if (!allowedEmail) return false
    return data.email.trim().toLowerCase() === allowedEmail.toLowerCase()
  })

export interface ContactMessageRow {
  id: string
  name: string
  email: string
  message: string
  created_at: string
}

export interface DashboardData {
  contactMessages: Array<ContactMessageRow>
  topPages: Array<{ path: string; views: number }>
  totalViews: number
}

export type DashboardResult =
  | { ok: true; data: DashboardData }
  | { ok: false; reason: 'not-configured' | 'unauthorized' }

async function verifyAllowedUser(accessToken: string): Promise<boolean> {
  const admin = getAdminSupabaseClient()
  const allowedEmail = getDashboardAllowedEmail()
  if (!admin || !allowedEmail) return false
  const { data, error } = await admin.auth.getUser(accessToken)
  if (error || !data.user?.email) return false
  return data.user.email.toLowerCase() === allowedEmail.toLowerCase()
}

/**
 * The client sends its Supabase access token; we verify it server-side
 * against the allowlisted email before ever touching the service-role
 * client. The service-role key itself never leaves the server.
 */
export const getDashboardData = createServerFn({ method: 'POST' })
  .validator((input: { accessToken: string }) => input)
  .handler(async ({ data }): Promise<DashboardResult> => {
    if (!isDashboardConfigured()) return { ok: false, reason: 'not-configured' }

    const authorized = await verifyAllowedUser(data.accessToken)
    if (!authorized) return { ok: false, reason: 'unauthorized' }

    const admin = getAdminSupabaseClient()!
    const [{ data: messages }, { data: events }] = await Promise.all([
      admin
        .from('contact_messages')
        .select('id, name, email, message, created_at')
        .order('created_at', { ascending: false })
        .limit(50),
      admin
        .from('page_events')
        .select('path')
        .order('created_at', { ascending: false })
        .limit(2000),
    ])

    const counts = new Map<string, number>()
    for (const event of events ?? []) {
      counts.set(event.path, (counts.get(event.path) ?? 0) + 1)
    }
    const topPages = [...counts.entries()]
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 20)

    return {
      ok: true,
      data: {
        contactMessages: (messages ?? []) as Array<ContactMessageRow>,
        topPages,
        totalViews: events?.length ?? 0,
      },
    }
  })
