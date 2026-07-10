import { createHash, timingSafeEqual } from 'node:crypto'
import { createServerFn } from '@tanstack/react-start'
import { getSession, useSession } from '@tanstack/react-start/server'
import { getAdminSupabaseClient } from './supabase'
import {
  getDashboardPassword,
  getDashboardSecurityAnswer,
  getDashboardSecurityQuestion,
  getDashboardSessionSecret,
  isDashboardConfigured,
} from './env'

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

interface DashboardSessionData {
  authenticated?: boolean
}

function dashboardSessionConfig() {
  return {
    password: getDashboardSessionSecret()!,
    name: 'dashboard',
    maxAge: 60 * 60 * 24 * 30,
  }
}

function hash(value: string): Buffer {
  return createHash('sha256').update(value).digest()
}

/** Constant-time compare, hashed first so differing lengths don't leak via timing. */
function secureEqual(candidate: string, expected: string): boolean {
  return timingSafeEqual(hash(candidate), hash(expected))
}

function normalize(value: string): string {
  return value.trim().toLowerCase()
}

/** Question text only — safe to send to an unauthenticated client. Answers never leave the server. */
export const getDashboardSecurityQuestions = createServerFn({ method: 'GET' }).handler(
  (): { question1: string; question2: string } | null => {
    const question1 = getDashboardSecurityQuestion(1)
    const question2 = getDashboardSecurityQuestion(2)
    if (!question1 || !question2) return null
    return { question1, question2 }
  },
)

export const dashboardSignIn = createServerFn({ method: 'POST' })
  .validator((input: { password: string; answer1: string; answer2: string }) => input)
  .handler(async ({ data }): Promise<{ ok: boolean }> => {
    const expectedPassword = getDashboardPassword()
    const expectedAnswer1 = getDashboardSecurityAnswer(1)
    const expectedAnswer2 = getDashboardSecurityAnswer(2)
    if (
      !expectedPassword ||
      !expectedAnswer1 ||
      !expectedAnswer2 ||
      !getDashboardSessionSecret()
    ) {
      return { ok: false }
    }

    const passwordOk = secureEqual(data.password, expectedPassword)
    const answer1Ok = secureEqual(normalize(data.answer1), normalize(expectedAnswer1))
    const answer2Ok = secureEqual(normalize(data.answer2), normalize(expectedAnswer2))
    if (!passwordOk || !answer1Ok || !answer2Ok) return { ok: false }

    const session = await useSession<DashboardSessionData>(dashboardSessionConfig())
    await session.update({ authenticated: true })
    return { ok: true }
  })

export const dashboardSignOut = createServerFn({ method: 'POST' }).handler(async () => {
  const session = await useSession<DashboardSessionData>(dashboardSessionConfig())
  await session.clear()
})

/**
 * Reads the sealed session cookie set by dashboardSignIn — no token needs to
 * be sent from the client, the browser just carries the cookie automatically.
 */
export const getDashboardData = createServerFn({ method: 'POST' }).handler(
  async (): Promise<DashboardResult> => {
    if (!isDashboardConfigured()) return { ok: false, reason: 'not-configured' }

    const session = await getSession<DashboardSessionData>(dashboardSessionConfig())
    if (!session.data.authenticated) return { ok: false, reason: 'unauthorized' }

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
  },
)
