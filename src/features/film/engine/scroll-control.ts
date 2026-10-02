/*
 * Directed scrolling (owner decision, 2026-10-02 — DESIGN.md §3, ACCESSIBILITY.md §1).
 *
 * The visitor still drives, but the film sets the pace:
 *   speed cap   every wheel/touch delta is clamped, so a hard flick can't skip scenes
 *   detents     crossing a stop (a beat's HOLD frame) halts there for a moment;
 *               the next gesture continues past it
 *   settle      when input stops near a stop, the page glides onto it
 *   keys        ↓ / PageDown / Space step to the next stop, ↑ / PageUp back
 *
 * Only runs in film modes; reduced motion gets the static page with native scroll.
 */
import type Lenis from 'lenis'

export interface ScrollControl {
  /** Recompute stop positions (px) after layout changes */
  setStops: (stops: Array<number>) => void
  next: (direction: 1 | -1) => void
  dispose: () => void
}

const HOLD_MS = 520
const SETTLE_DELAY_MS = 170
const EPSILON = 2

export function createScrollControl(
  lenis: Lenis,
  viewportHeight: () => number,
): ScrollControl {
  let stops: Array<number> = []
  let lockedUntil = 0
  let released: number | null = null
  let settleTimer = 0

  const duration = (distance: number) =>
    Math.min(1.25, Math.max(0.5, distance / 2200))
  const ease = (t: number) => 1 - Math.pow(1 - t, 3)

  function glideTo(target: number) {
    const distance = Math.abs(target - lenis.scroll)
    lenis.scrollTo(target, { duration: duration(distance), easing: ease })
  }

  function stopBetween(from: number, to: number) {
    if (to > from)
      return stops.find((stop) => stop > from + EPSILON && stop <= to)
    return [...stops]
      .reverse()
      .find((stop) => stop < from - EPSILON && stop >= to)
  }

  function scheduleSettle() {
    window.clearTimeout(settleTimer)
    settleTimer = window.setTimeout(() => {
      if (performance.now() < lockedUntil || Math.abs(lenis.velocity) > 2)
        return
      const radius = viewportHeight() * 0.16
      const position = lenis.targetScroll
      const nearest = stops.reduce<number | null>(
        (best, stop) =>
          Math.abs(stop - position) <= radius &&
          (best === null ||
            Math.abs(stop - position) < Math.abs(best - position))
            ? stop
            : best,
        null,
      )
      if (nearest !== null && Math.abs(nearest - position) > EPSILON) {
        released = nearest
        glideTo(nearest)
      }
    }, SETTLE_DELAY_MS)
  }

  /* Returning false skips Lenis entirely — so we must cancel the native scroll ourselves */
  function swallow(event: Event) {
    if (event.cancelable) event.preventDefault()
    return false
  }

  function arriveAt(stop: number) {
    released = stop
    lockedUntil =
      performance.now() +
      HOLD_MS +
      duration(Math.abs(stop - lenis.scroll)) * 600
    glideTo(stop)
  }

  /* Called by Lenis for every wheel / touch delta before it moves */
  function virtualScroll(data: {
    deltaY: number
    event: WheelEvent | TouchEvent
  }) {
    const vh = viewportHeight()
    const { event } = data
    const isTouch = event.type.startsWith('touch')
    // A detent is holding: swallow input until it lets go
    if (performance.now() < lockedUntil) return swallow(event)

    const from = lenis.targetScroll
    if (released !== null && Math.abs(from - released) > vh * 0.05)
      released = null

    // Touch release: Lenis would add uncapped inertia — we take it over
    if (event.type === 'touchend') {
      const direction = Math.sign(lenis.velocity || data.deltaY)
      const inertia =
        Math.min(vh * 0.55, Math.abs(lenis.velocity) ** 1.45) * direction
      if (Math.abs(inertia) < 1) return true
      const stop = stopBetween(from, from + inertia)
      if (stop !== undefined && stop !== released) arriveAt(stop)
      else {
        lenis.scrollTo(from + inertia, { duration: 0.9, easing: ease })
        scheduleSettle()
      }
      return swallow(event)
    }

    const cap = vh * (isTouch ? 0.22 : 0.14)
    data.deltaY = Math.max(-cap, Math.min(cap, data.deltaY))
    const stop = stopBetween(from, from + data.deltaY)
    if (stop !== undefined && stop !== released) {
      arriveAt(stop)
      return swallow(event)
    }
    scheduleSettle()
    return true
  }

  function next(direction: 1 | -1) {
    const position = lenis.targetScroll
    const target =
      direction > 0
        ? stops.find((stop) => stop > position + EPSILON)
        : [...stops].reverse().find((stop) => stop < position - EPSILON)
    if (target === undefined) {
      lenis.scrollTo(direction > 0 ? lenis.limit : 0, { duration: 1 })
      return
    }
    released = target
    lockedUntil = performance.now() + 250
    glideTo(target)
  }

  function onKey(event: KeyboardEvent) {
    if (
      event.defaultPrevented ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    )
      return
    const target = event.target instanceof Element ? event.target : null
    if (
      target?.closest(
        'input, textarea, select, [contenteditable], dialog[open]',
      )
    )
      return
    const down =
      event.key === 'ArrowDown' ||
      event.key === 'PageDown' ||
      (event.key === ' ' && !event.shiftKey)
    const up =
      event.key === 'ArrowUp' ||
      event.key === 'PageUp' ||
      (event.key === ' ' && event.shiftKey)
    if (!down && !up) return
    // Only steer inside the film; the credits below scroll natively
    if (
      stops.length === 0 ||
      lenis.targetScroll > stops[stops.length - 1] + EPSILON
    ) {
      if (!(
        up && lenis.targetScroll <= stops[stops.length - 1] + viewportHeight()
      ))
        return
    }
    event.preventDefault()
    next(down ? 1 : -1)
  }

  window.addEventListener('keydown', onKey)
  // Lenis exposes its options object; installing the hook after construction keeps one instance
  ;(lenis.options as { virtualScroll?: typeof virtualScroll }).virtualScroll =
    virtualScroll

  return {
    setStops(positions) {
      stops = [...positions].sort((a, b) => a - b)
    },
    next,
    dispose() {
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(settleTimer)
      ;(lenis.options as { virtualScroll?: unknown }).virtualScroll = undefined
    },
  }
}
