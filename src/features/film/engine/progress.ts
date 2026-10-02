/*
 * Pure scroll math. Everything visual in the film is a function of one number,
 * the film time T: scene index + local progress (0 → 1). Scene i is pinned for
 * scroll positions [top_i, top_i + len_i]; consecutive scenes overlap by one
 * viewport (Engineering §4.2), so top_{i+1} === top_i + len_i and T is
 * continuous across boundaries.
 */

export interface SceneMetric {
  /** Document scroll offset at which the scene's layers stick */
  top: number
  /** Pinned scroll distance in px */
  len: number
}

const clamp01 = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value)

/** Film time T for a scroll position */
export function filmTime(
  scrollY: number,
  metrics: ReadonlyArray<SceneMetric>,
): number {
  if (metrics.length === 0) return 0
  let index = 0
  for (let i = metrics.length - 1; i >= 0; i--) {
    if (scrollY >= metrics[i].top) {
      index = i
      break
    }
  }
  const { top, len } = metrics[index]
  return index + (len > 0 ? clamp01((scrollY - top) / len) : 1)
}

/** Scroll position that shows scene `index` at local progress `p` */
export function scrollFor(
  index: number,
  p: number,
  metrics: ReadonlyArray<SceneMetric>,
): number {
  const metric = metrics.at(Math.max(0, Math.min(metrics.length - 1, index)))
  if (!metric) return 0
  return Math.round(metric.top + clamp01(p) * metric.len)
}

/** How far the page has scrolled past the end of the film (credits/footer) */
export function scrolledPastFilm(
  scrollY: number,
  metrics: ReadonlyArray<SceneMetric>,
): number {
  const last = metrics.at(-1)
  if (!last) return 0
  return Math.max(0, scrollY - (last.top + last.len))
}

/** Splits T into scene index + local progress */
export function splitTime(
  time: number,
  sceneCount: number,
): { index: number; p: number } {
  const t = Math.max(0, Math.min(sceneCount, time))
  const index = Math.min(sceneCount - 1, Math.floor(t))
  return { index, p: t - index }
}
