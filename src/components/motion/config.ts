/*
 * Motion constants for motion/react — mirrors the CSS tokens in
 * src/styles.css (--duration-*, --ease-out-quart). Keep both in sync.
 */

export const durations = {
  fast: 0.15,
  base: 0.25,
  slow: 0.4,
  reveal: 0.6,
} as const

/** cubic-bezier(0.25, 1, 0.5, 1) — ease-out-quart */
export const easeOutQuart = [0.25, 1, 0.5, 1] as const

/** cubic-bezier(0.22, 0.61, 0.36, 1) — fluid/spring-like, used for Reveal */
export const easeFluid = [0.22, 0.61, 0.36, 1] as const

/** Distance in px for fade-up entrances */
export const revealOffset = 16

/** Starting blur (px) for scroll reveals — settles to 0 */
export const revealBlur = 6
