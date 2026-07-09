import { motion, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { durations, easeFluid, revealBlur, revealOffset } from './config'
import type { ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  /** Stagger entrance by this many seconds (e.g. index * 0.06) */
  delay?: number
  className?: string
}

/**
 * Fade-up entrance when the element scrolls into view. Runs once.
 * With reduced motion preferred, falls back to a plain fade.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const reducedMotion = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-64px' })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (inView) {
      setVisible(true)
      return
    }
    // Some mobile browsers don't fire IntersectionObserver's first callback
    // until a scroll/compositing pass completes (e.g. on touchend), which
    // leaves already-visible content (like the hero) stuck at opacity: 0
    // until the user scrolls. Check actual position as a fallback so
    // content already on screen never waits on the observer.
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setVisible(true)
    }
  }, [inView])

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{
        opacity: 0,
        y: reducedMotion ? 0 : revealOffset,
        filter: reducedMotion ? 'blur(0px)' : `blur(${revealBlur}px)`,
      }}
      animate={visible ? { opacity: 1, y: 0, filter: 'blur(0px)' } : undefined}
      transition={{ duration: durations.reveal, ease: easeFluid, delay }}
    >
      {children}
    </motion.div>
  )
}
