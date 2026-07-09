import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'

/**
 * Thin page-scroll progress bar fixed to the top of the viewport.
 * A progress indicator conveys position, so it stays functional under
 * reduced motion — it just tracks without smoothing.
 */
export function ReadingProgress() {
  const { scrollYProgress } = useScroll()
  const reducedMotion = useReducedMotion()
  // For reduced motion, use a direct transform without spring/transition
  const scaleX = useTransform(scrollYProgress, (v) => v)

  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-accent print:hidden"
      style={{
        scaleX: reducedMotion ? scaleX : scrollYProgress,
        transition: reducedMotion ? 'none' : undefined,
      }}
    />
  )
}
