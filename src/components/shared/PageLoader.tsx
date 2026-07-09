import { useEffect, useState } from 'react'
import { cn } from '#/lib/utils'

const HOLD_MS = 550
const FADE_MS = 400

/**
 * Brief boot splash shown once when the app first mounts — covers the
 * unstyled-content flash on a cold load and gives the site an intentional
 * "arrival" instead of just popping into view. Never shown again during the
 * SPA session since RootLayout only mounts once.
 */
export function PageLoader() {
  const [mounted, setMounted] = useState(false)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const hold = reducedMotion ? 0 : HOLD_MS
    const fadeTimer = window.setTimeout(() => setFading(true), hold)
    const removeTimer = window.setTimeout(() => setMounted(true), hold + (reducedMotion ? 0 : FADE_MS))
    return () => {
      window.clearTimeout(fadeTimer)
      window.clearTimeout(removeTimer)
    }
  }, [])

  if (mounted) return null

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-(--duration-slow)',
        fading ? 'pointer-events-none opacity-0' : 'opacity-100',
      )}
      aria-hidden
    >
      <div className="flex flex-col items-center gap-4">
        <span className="loader-mark font-display text-title-2 font-semibold text-foreground">
          AR
        </span>
        <span className="loader-bar" />
      </div>
    </div>
  )
}
