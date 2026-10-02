import { describe, expect, it } from 'vitest'
import { filmTime, scrollFor, scrolledPastFilm, splitTime } from './progress'
import { SCENES } from '../config/scenes'

// Three scenes of 1000px, 2000px and 500px pinned length, overlapped back to back
const metrics = [
  { top: 0, len: 1000 },
  { top: 1000, len: 2000 },
  { top: 3000, len: 500 },
]

describe('filmTime', () => {
  it('is 0 at the top and the scene count at the end', () => {
    expect(filmTime(0, metrics)).toBe(0)
    expect(filmTime(3500, metrics)).toBe(3)
    expect(filmTime(99999, metrics)).toBe(3)
  })

  it('maps local progress inside a scene', () => {
    expect(filmTime(500, metrics)).toBeCloseTo(0.5)
    expect(filmTime(2000, metrics)).toBeCloseTo(1.5)
    expect(filmTime(3250, metrics)).toBeCloseTo(2.5)
  })

  it('is continuous across scene boundaries', () => {
    expect(filmTime(999.999, metrics)).toBeCloseTo(1, 4)
    expect(filmTime(1000, metrics)).toBe(1)
  })

  it('clamps above the film start', () => {
    expect(filmTime(-200, metrics)).toBe(0)
  })
})

describe('scrollFor / filmTime round trip', () => {
  it('returns to the same time', () => {
    for (const [index, p] of [
      [0, 0.3],
      [1, 0.82],
      [2, 0.1],
    ] as const) {
      expect(filmTime(scrollFor(index, p, metrics), metrics)).toBeCloseTo(
        index + p,
        2,
      )
    }
  })
})

describe('scrolledPastFilm', () => {
  it('is zero inside the film and grows after it', () => {
    expect(scrolledPastFilm(3400, metrics)).toBe(0)
    expect(scrolledPastFilm(3700, metrics)).toBe(200)
  })
})

describe('splitTime', () => {
  it('never returns an index past the last scene', () => {
    expect(splitTime(3, 3)).toEqual({ index: 2, p: 1 })
    expect(splitTime(1.25, 3)).toEqual({ index: 1, p: 0.25 })
  })
})

describe('scene registry', () => {
  it('has unique ids, positive lengths and ordered stops inside each scene', () => {
    expect(new Set(SCENES.map((scene) => scene.id)).size).toBe(SCENES.length)
    for (const scene of SCENES) {
      expect(scene.length.d).toBeGreaterThan(0)
      expect(scene.length.m).toBeGreaterThan(0)
      expect(scene.stops.length).toBeGreaterThan(0)
      for (const stop of scene.stops) {
        expect(stop).toBeGreaterThanOrEqual(0)
        expect(stop).toBeLessThanOrEqual(1)
      }
      // stops are ordered, so directed scrolling meets them in sequence
      expect([...scene.stops].sort((a, b) => a - b)).toEqual(scene.stops)
    }
  })
})
