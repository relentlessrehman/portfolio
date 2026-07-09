import { useEffect } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { logPageEvent } from '#/server/analytics'

/**
 * Cookie-less page-view logging — no client id, no cookie, no fingerprint,
 * just path + referrer. Skipped in development so local testing never
 * pollutes real analytics. No-ops silently if Supabase isn't configured.
 */
export function PageViewTracker() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const track = useServerFn(logPageEvent)

  useEffect(() => {
    if (import.meta.env.DEV) return
    track({ data: { path: pathname, referrer: document.referrer || undefined } }).catch(() => {
      // Analytics must never surface an error to a visitor.
    })
  }, [pathname, track])

  return null
}
