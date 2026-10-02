import { useEffect, useState } from 'react'
import {
  MOTION_CHANGE_EVENT,
  currentFilmMode,
  setMotionPreference,
} from '#/features/film/engine/mode'
import { cn } from '#/lib/utils'

/**
 * MOTION: ON / OFF — overrides the OS reduced-motion setting in both
 * directions and switches the film live (ACCESSIBILITY.md §1).
 */
export function MotionToggle({ className }: { className?: string }) {
  const [on, setOn] = useState<boolean | null>(null)

  useEffect(() => {
    setOn(currentFilmMode() !== 'static')
    const sync = () => setOn(currentFilmMode() !== 'static')
    window.addEventListener(MOTION_CHANGE_EVENT, sync)
    return () => window.removeEventListener(MOTION_CHANGE_EVENT, sync)
  }, [])

  return (
    <button
      type="button"
      aria-pressed={on ?? undefined}
      onClick={() => setMotionPreference(on ? 'off' : 'on')}
      className={cn(
        'nav-label inline-flex min-h-11 items-center gap-2 px-3',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'size-1.5 rounded-full',
          on ? 'bg-accent' : 'bg-subtle-foreground',
        )}
      />
      Motion: {on === null ? '…' : on ? 'On' : 'Off'}
    </button>
  )
}
