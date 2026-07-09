import { useEffect, useRef, useState } from 'react'
import { animate, useInView, useReducedMotion } from 'motion/react'
import { durations, easeOutQuart } from './config'

interface CountUpProps {
  to: number
  suffix?: string
}

/**
 * Counts from 0 to `to` when scrolled into view. Server-renders the final
 * value (correct without JS); reduced motion skips the animation entirely.
 */
export function CountUp({ to, suffix }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-64px' })
  const reducedMotion = useReducedMotion()
  const [value, setValue] = useState(to)

  useEffect(() => {
    if (!inView || reducedMotion) return
    const controls = animate(0, to, {
      duration: durations.reveal,
      ease: easeOutQuart,
      onUpdate: (latest) => setValue(Math.round(latest)),
    })
    return () => controls.stop()
  }, [inView, reducedMotion, to])

  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  )
}
