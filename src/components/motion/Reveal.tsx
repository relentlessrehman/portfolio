import { motion, useReducedMotion } from 'motion/react'
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

  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        y: reducedMotion ? 0 : revealOffset,
        filter: reducedMotion ? 'blur(0px)' : `blur(${revealBlur}px)`,
      }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-64px' }}
      transition={{ duration: durations.reveal, ease: easeFluid, delay }}
    >
      {children}
    </motion.div>
  )
}
