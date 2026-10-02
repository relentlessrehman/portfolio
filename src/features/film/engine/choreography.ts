/*
 * The film's choreography: ONE paused GSAP timeline whose time is the film
 * time T (scene index + local progress). The engine sets tl.time(T) from the
 * scroll position, so every frame is a pure function of scroll: reversible,
 * jumpable, screenshot-testable (Design §3.7, Engineering §5).
 *
 * Positions are fractions of the layer viewport (0 = centre, y down) for the
 * Core, and px computed at build time for DOM transforms. A resize rebuilds.
 * Beat timings follow docs/redesign/STORYBOARD.md.
 */
import gsap from 'gsap'
import type { GLState } from '../gl/stage'
import { SCENES, sceneIndex } from '../config/scenes'

export type CoreState = GLState

export function initialCore(compact: boolean): CoreState {
  return {
    x: 0,
    y: compact ? -0.2 : -0.17,
    s: compact ? 0.085 : 0.075,
    a: 1,
    dark: 0,
    e: 0,
    st: 0,
    split: 0,
    stream: 0,
    edges: 0,
    query: 0,
    path: 0,
    dolly: 0,
    rip: 0,
    ripA: 0,
  }
}

/** Rounded-rect outline the Core traces from laptop screen to phone (scene 06) */
export interface MorphState {
  cx: number
  cy: number
  w: number
  h: number
  r: number
  a: number
  trace: number
  tmix: number
}

export interface Built {
  tl: gsap.core.Timeline
  core: CoreState
  morph: MorphState
  /** Post-timeline derived values (tracer position, SVG attrs) → render state */
  derive: (out: CoreState) => void
  /** Builds scene timelines up to and including `index` (idempotent) */
  ensure: (index: number) => void
  /** Light background scenes flip nav/chrome to ink */
  tone: (time: number) => 'dark' | 'light'
  kill: () => void
}

interface Env {
  root: HTMLElement
  W: number
  H: number
  compact: boolean
}

export function buildFilm(env: Env): Built {
  const { root, W, H, compact } = env
  const core = initialCore(compact)
  const morph: MorphState = {
    cx: 0,
    cy: 0,
    w: 0,
    h: 0,
    r: 10,
    a: 0,
    trace: 0,
    tmix: 0,
  }
  const scenes = [...root.querySelectorAll<HTMLElement>('.f-scene')]
  const prop = (name: string) =>
    root.querySelector<HTMLElement>(`[data-p="${name}"]`)
  const props = {
    laptop: prop('laptop'),
    phone: prop('phone'),
    beam: prop('beam'),
    card: prop('card'),
    glare: prop('glare'),
    morphSvg: root.querySelector<SVGSVGElement>('[data-p="morph"]'),
    rect: root.querySelector<SVGRectElement>('[data-p="rect"]'),
    trail: root.querySelector<SVGRectElement>('[data-p="trail"]'),
    screens: [...root.querySelectorAll<HTMLElement>('[data-p="screen"]')],
  }
  const bg = (name: string) =>
    root.querySelector<HTMLElement>(`[data-b="${name}"]`)
  const minWH = Math.min(W, H)

  /* Geometry read BEFORE any tween touches the DOM (ctx.revert() ran first) */
  const laptopW = props.laptop?.offsetWidth ?? W * 0.5
  const laptopH = props.laptop?.offsetHeight ?? laptopW / 1.6
  const phoneW = props.phone?.offsetWidth ?? 300
  const phoneH = props.phone?.offsetHeight ?? 640
  const measureIn = (scene: HTMLElement | undefined, selector: string) => {
    const el = scene?.querySelector<HTMLElement>(selector)
    const layer = el?.closest<HTMLElement>('.f-layer')
    if (!el || !layer) return null
    const r = el.getBoundingClientRect()
    const l = layer.getBoundingClientRect()
    return { x: r.left - l.left, y: r.top - l.top, w: r.width, h: r.height }
  }
  const fx = (px: number) => px / W - 0.5
  const fy = (px: number) => px / H - 0.5

  /* All remaining layout reads, batched before the first style write */
  const periodEl = scenes[sceneIndex('contact')]?.querySelector<HTMLElement>(
    '[data-anchor="period"]',
  )
  const trackEl =
    scenes[sceneIndex('timeline')]?.querySelector<HTMLElement>(
      '[data-f="track"]',
    )
  const trackRect = trackEl?.getBoundingClientRect()
  const geo = {
    panels: [1, 2, 3, 4].map((k) =>
      measureIn(scenes[sceneIndex('stayza-detail')], `.f-panel--${k}`),
    ),
    thumbs: [1, 2, 3, 4].map((k) =>
      measureIn(scenes[sceneIndex('contact')], `.f-thumb--${k}`),
    ),
    period: measureIn(scenes[sceneIndex('contact')], '[data-anchor="period"]'),
    periodFont: periodEl ? parseFloat(getComputedStyle(periodEl).fontSize) : 0,
    line: measureIn(scenes[sceneIndex('timeline')], '.f-tl__line'),
    // how far each toolkit row overflows its frame — the drift that reveals it
    toolkitOverflow: [
      ...(scenes[sceneIndex('toolkit')]?.querySelectorAll<HTMLElement>(
        '[data-f="tktrack"]',
      ) ?? []),
    ].map((track) =>
      Math.max(0, track.scrollWidth - (track.parentElement?.clientWidth ?? W)),
    ),
    track: measureIn(scenes[sceneIndex('timeline')], '[data-f="track"]'),
    milestones: [
      ...(scenes[sceneIndex('timeline')]?.querySelectorAll<HTMLElement>(
        '.f-tl__dot',
      ) ?? []),
    ].map((dot) => {
      const r = dot.getBoundingClientRect()
      return trackRect
        ? compact
          ? r.top + r.height / 2 - trackRect.top
          : r.left + r.width / 2 - trackRect.left
        : 0
    }),
  }

  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } })

  // Scenes are built lazily (Performance §3): only the first scenes at boot, then
  // each next scene while you're still in the one before it — no long task.
  const builders: Array<() => void> = [] // one per scene, in SCENES order
  let builtUpTo = -1

  const ctx = gsap.context(() => {
    /* helpers bound per scene */
    const at = (i: number) => (p: number) => i + p
    const sel = (i: number) => (name: string) =>
      scenes[i]
        ? [...scenes[i].querySelectorAll<HTMLElement>(`[data-f="${name}"]`)]
        : []
    const coreTo = (
      vars: Partial<CoreState>,
      time: number,
      duration: number,
      ease = 'power2.inOut',
    ) => tl.to(core, { ...vars, duration, ease }, time)
    const enter = (
      targets: gsap.TweenTarget,
      time: number,
      duration: number,
      vars: gsap.TweenVars,
      ease = 'power3.out',
    ) =>
      tl.from(
        targets,
        { opacity: 0, ...vars, duration, ease, immediateRender: true },
        time,
      )
    const exit = (
      targets: gsap.TweenTarget,
      time: number,
      duration: number,
      vars: gsap.TweenVars = {},
      ease = 'power2.in',
    ) => tl.to(targets, { opacity: 0, ...vars, duration, ease }, time)
    /** Text rising from behind its mask (Mask primitive) — the film's type reveal */
    const rise = (
      targets: gsap.TweenTarget,
      time: number,
      duration: number,
      stagger = 0,
    ) =>
      tl.fromTo(
        targets,
        { yPercent: 118 },
        {
          yPercent: 0,
          duration,
          stagger,
          ease: 'expo.out',
          immediateRender: true,
        },
        time,
      )
    const corner = (i: number) => {
      const c = sel(i)('corner')
      enter(c, i + 0.02, 0.06, {})
      exit(c, i + 0.92, 0.06)
    }

    /* Props start hidden and centred */
    const centered = { xPercent: -50, yPercent: -50, left: '50%', top: '50%' }
    if (props.laptop)
      gsap.set(props.laptop, {
        ...centered,
        opacity: 0,
        transformPerspective: 1600,
      })
    if (props.phone)
      gsap.set(props.phone, {
        ...centered,
        opacity: 0,
        transformPerspective: 1400,
      })
    if (props.card) gsap.set(props.card, { opacity: 0 })
    if (props.glare) gsap.set(props.glare, { xPercent: -70 })

    /* Depth: big titles in the back layer drift slowly against the scroll —
       the Core and the products move at their own pace in front of them */
    for (const id of ['stayza', 'campusflow', 'madad']) {
      const index = sceneIndex(id)
      const frame = scenes[index]?.querySelector('[data-layer="back"] .f-frame')
      if (frame)
        tl.fromTo(
          frame,
          { x: 0.012 * W },
          { x: -0.012 * W, duration: 1, immediateRender: false },
          index,
        )
    }
    if (props.beam) gsap.set(props.beam, { opacity: 0 })
    for (const name of ['stage', 'paper', 'ridge', 'horizon']) {
      const el = bg(name)
      if (el) gsap.set(el, { autoAlpha: 0 })
    }

    /* ── 01 Intro ── */
    builders.push(() => {
      const i = sceneIndex('intro')
      const t = at(i)
      const s = sel(i)
      coreTo(
        {
          s: compact ? 0.1 : 0.1,
          x: compact ? 0.12 : 0.16,
          y: compact ? 0.02 : 0.06,
        },
        t(0.15),
        0.55,
        'power1.inOut',
      )
      const a = s('nameA').at(0)
      const b = s('nameB').at(0)
      if (compact) {
        tl.to(
          a ?? [],
          { y: -0.42 * H, scale: 1.4, duration: 0.55, ease: 'power2.in' },
          t(0.15),
        )
        tl.to(
          b ?? [],
          { y: 0.42 * H, scale: 1.4, duration: 0.55, ease: 'power2.in' },
          t(0.15),
        )
      } else {
        tl.to(
          a ?? [],
          { x: -0.5 * W, scale: 1.5, duration: 0.55, ease: 'power2.in' },
          t(0.15),
        )
        tl.to(
          b ?? [],
          { x: 0.5 * W, scale: 1.5, duration: 0.55, ease: 'power2.in' },
          t(0.15),
        )
      }
      exit([a, b].filter(Boolean), t(0.66), 0.04)
      exit(
        [...s('l1'), ...s('l2'), ...s('cue'), ...s('corner')],
        t(0.7),
        0.15,
        { y: 0.08 * H },
      )
    })

    /* ── 02 Identity ── */
    builders.push(() => {
      const i = sceneIndex('identity')
      const t = at(i)
      const s = sel(i)
      corner(i)
      const path = compact
        ? [
            { x: 0.26, y: -0.3 },
            { x: 0.12, y: -0.19 },
            { x: -0.06, y: -0.08 },
            { x: 0.1, y: 0.06 },
          ]
        : [
            { x: -0.12, y: -0.28 },
            { x: 0.06, y: -0.05 },
            { x: 0.2, y: 0.17 },
            { x: 0.26, y: 0.22 },
          ]
      coreTo({ ...path[0], s: compact ? 0.075 : 0.065 }, t(0), 0.12)
      const words = [s('w1'), s('w2'), s('w3')]
      const enters = [0.05, 0.32, 0.55]
      words.forEach((word, k) => {
        enter(
          word,
          t(enters[k]),
          0.16,
          { x: -1.05 * W, opacity: 1 },
          'power2.out',
        )
        if (k > 0) coreTo(path[k], t(enters[k] - 0.02), 0.16)
      })
      coreTo(path[3], t(0.72), 0.16)
      tl.to(words.flat(), { opacity: 0.26, duration: 0.08 }, t(0.66))
      rise(s('word'), t(0.67), 0.06, 0.014)
      exit([...words.flat(), ...s('statement')], t(0.92), 0.08, { scale: 1.08 })
    })

    /* ── 03 The Drop ── */
    builders.push(() => {
      const i = sceneIndex('drop')
      const t = at(i)
      const s = sel(i)
      corner(i)
      coreTo({ x: 0, y: -0.3, s: compact ? 0.06 : 0.05 }, t(0), 0.2)
      if (props.beam) {
        const coreTopPx = H * 0.2 - minWH * 0.05
        gsap.set(props.beam, {
          height: Math.max(40, coreTopPx),
          left: '50%',
          xPercent: -50,
          top: 0,
        })
        tl.to(props.beam, { opacity: 0.75, duration: 0.1 }, t(0.2))
        tl.to(props.beam, { opacity: 0, duration: 0.12 }, t(0.42))
      }
      coreTo({ y: 0.14, st: 0.07 }, t(0.3), 0.25, 'power2.in')
      coreTo({ st: 0 }, t(0.55), 0.05, 'power2.out')
      tl.to(core, { ripA: 1, duration: 0.03 }, t(0.55))
      tl.to(core, { rip: 1, duration: 0.33, ease: 'power1.out' }, t(0.55))
      tl.to(core, { ripA: 0, duration: 0.13 }, t(0.86))
      enter(s('tag'), t(0.6), 0.06, { x: 24, stagger: 0.05 })
      exit(s('tag'), t(0.92), 0.06)
      const stage = bg('stage')
      if (stage) tl.to(stage, { autoAlpha: 1, duration: 0.25 }, t(0.75))
    })

    /* ── 04 Stayza ── */
    const laptopX = compact ? 0 : 0.235 * W
    const laptopY = compact ? -0.19 * H : 0.03 * H
    builders.push(() => {
      const i = sceneIndex('stayza')
      const t = at(i)
      const s = sel(i)
      corner(i)
      if (props.laptop) {
        tl.fromTo(
          props.laptop,
          { x: laptopX, y: 0.5 * H, rotateX: 24, opacity: 0, scale: 1 },
          {
            x: laptopX,
            y: laptopY,
            rotateX: 6,
            opacity: 1,
            duration: 0.3,
            ease: 'power3.out',
            immediateRender: false,
          },
          t(0),
        )
      }
      // light slides across the glass as the screen tilts toward you
      if (props.glare)
        tl.fromTo(
          props.glare,
          { xPercent: -70 },
          {
            xPercent: 70,
            duration: 0.34,
            ease: 'power2.inOut',
            immediateRender: false,
          },
          t(0.02),
        )
      const cornerX = fx(W / 2 + laptopX + laptopW / 2) + 0.025
      const cornerY = fy(H / 2 + laptopY - laptopH / 2) - 0.02
      coreTo(
        { x: Math.min(0.44, cornerX), y: cornerY, s: compact ? 0.04 : 0.032 },
        t(0.04),
        0.3,
        'power3.out',
      )
      rise(s('tchar'), t(0.2), 0.1, 0.014)
      const copy = scenes[i]?.querySelector('[data-f="copy"]')
      if (copy) enter(copy.children, t(0.34), 0.06, { x: -30, stagger: 0.03 })
      enter(s('index'), t(0.45), 0.1, { y: 16 })
      // 0.80 → camera moves toward the product; text exits right, title slides behind the laptop
      if (props.laptop) {
        tl.to(
          props.laptop,
          {
            x: 0,
            y: 0,
            rotateX: 0,
            scale: compact ? 1.2 : 1.35,
            duration: 0.2,
            ease: 'power2.in',
          },
          t(0.8),
        )
      }
      exit(s('title'), t(0.8), 0.2, { x: 0.3 * W })
      exit([...(copy ? [copy] : []), ...s('index')], t(0.8), 0.12, {
        x: 0.12 * W,
      })
    })

    /* ── 05 Stayza, up close ── */
    builders.push(() => {
      const i = sceneIndex('stayza-detail')
      const t = at(i)
      const s = sel(i)
      corner(i)
      const panels = s('panel')
      const stops = s('stop')
      const group = s('panels')
      if (props.laptop) {
        tl.to(
          props.laptop,
          { scale: compact ? 2.6 : 3.2, duration: 0.14, ease: 'power2.in' },
          t(0),
        )
        tl.to(props.laptop, { opacity: 0, duration: 0.06 }, t(0.08))
      }
      enter(group, t(0.06), 0.12, { scale: 0.85 })
      const rects = geo.panels
      const starts = [0.18, 0.35, 0.52, 0.69]
      panels.forEach((panel, k) => {
        const start = starts[k]
        if (compact) {
          tl.fromTo(
            panel,
            { x: W, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: 0.06,
              ease: 'power3.out',
              immediateRender: k > 0,
            },
            t(start - 0.04),
          )
          if (k < panels.length - 1)
            tl.to(
              panel,
              { x: -W, opacity: 0, duration: 0.06, ease: 'power2.in' },
              t(starts[k + 1] - 0.04),
            )
        } else {
          tl.to(panel, { opacity: 1, z: 60, duration: 0.05 }, t(start))
          if (k < panels.length - 1)
            tl.to(
              panel,
              { opacity: 0.32, z: 0, duration: 0.05 },
              t(starts[k + 1]),
            )
        }
        const stop = stops.at(k)
        if (stop) {
          enter(stop, t(start), 0.05, { y: 18 })
          if (k < stops.length - 1) exit(stop, t(starts[k + 1] - 0.02), 0.03)
        }
        const r = rects[k]
        if (r) {
          const px = compact ? r.x + r.w - 6 : r.x - 10
          const py = compact ? r.y - 10 : r.y + 12
          coreTo(
            { x: fx(px), y: fy(py), s: compact ? 0.032 : 0.026 },
            t(start - 0.03),
            0.07,
          )
        }
      })
      exit([...group, ...stops.slice(-1)], t(0.86), 0.08, { scale: 0.92 })
      // the laptop comes back small at left-centre: hand-off to 06
      if (props.laptop) {
        tl.fromTo(
          props.laptop,
          {
            x: compact ? 0 : -0.2 * W,
            y: compact ? -0.05 * H : 0,
            scale: compact ? 0.6 : 0.45,
            opacity: 0,
            rotateX: 0,
          },
          { opacity: 1, duration: 0.08, immediateRender: false },
          t(0.9),
        )
      }
    })

    /* ── 06 Web → Mobile ── */
    builders.push(() => {
      const i = sceneIndex('to-mobile')
      const t = at(i)
      const s = sel(i)
      corner(i)
      const scale = compact ? 0.6 : 0.45
      const startCx = W / 2 + (compact ? 0 : -0.2 * W)
      const startCy = H / 2 + (compact ? -0.05 * H : 0)
      const screenW = laptopW * scale * 0.94
      const screenH = screenW / 1.6
      const phoneX = compact ? 0 : 0.14 * W
      Object.assign(morph, {
        cx: startCx,
        cy: startCy,
        w: screenW,
        h: screenH,
        r: 8,
        a: 0,
      })
      if (props.laptop)
        tl.to(props.laptop, { opacity: 0, duration: 0.14 }, t(0.02))
      tl.to(morph, { a: 1, duration: 0.1 }, t(0.02))
      tl.to(core, { s: compact ? 0.024 : 0.018, duration: 0.1 }, t(0.05))
      tl.to(morph, { tmix: 1, duration: 0.06 }, t(0.12))
      tl.to(
        morph,
        {
          cx: W / 2 + phoneX,
          cy: H / 2,
          w: phoneW * 0.93,
          h: phoneH * 0.96,
          r: compact ? 34 : 40,
          duration: 0.62,
          ease: 'power2.inOut',
        },
        t(0.15),
      )
      tl.to(morph, { trace: 2, duration: 0.66, ease: 'power1.inOut' }, t(0.13))
      tl.to(morph, { tmix: 0, duration: 0.08 }, t(0.78))
      if (props.phone) {
        tl.fromTo(
          props.phone,
          { x: phoneX, y: 0, opacity: 0, scale: 0.97, rotateY: 0 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.12,
            ease: 'power2.out',
            immediateRender: false,
          },
          t(0.8),
        )
      }
      tl.to(morph, { a: 0, duration: 0.1 }, t(0.86))
      coreTo(
        {
          x: fx(W / 2 + phoneX - phoneW / 2) - 0.05,
          y: 0.18,
          s: compact ? 0.04 : 0.034,
        },
        t(0.8),
        0.16,
      )
      enter(s('by'), t(0.82), 0.08, { y: 10 })
      exit(s('by'), t(0.93), 0.05)
    })

    /* ── 07 CampusFlow (paper) ── */
    builders.push(() => {
      const i = sceneIndex('campusflow')
      const t = at(i)
      const s = sel(i)
      corner(i)
      const paper = bg('paper')
      const phoneX = compact ? 0 : 0.14 * W
      const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(3)}%`
      const sx = W / 2 + phoneX
      const sw = phoneW * 0.93
      const sh = phoneH * 0.96
      if (paper) {
        tl.set(paper, { autoAlpha: 1 }, t(0))
        tl.fromTo(
          paper,
          {
            clipPath: `inset(${pct(H / 2 - sh / 2, H)} ${pct(W - (sx + sw / 2), W)} ${pct(H / 2 - sh / 2, H)} ${pct(sx - sw / 2, W)} round 6%)`,
          },
          {
            clipPath: 'inset(0% 0% 0% 0% round 0%)',
            duration: 0.15,
            ease: 'power2.inOut',
            immediateRender: false,
          },
          t(0),
        )
      }
      coreTo({ dark: 1 }, t(0.02), 0.12)
      const targetPhoneX = compact ? 0 : 0.2 * W
      const phoneY = compact ? 0.11 * H : 0
      if (props.phone) {
        tl.to(
          props.phone,
          { x: targetPhoneX, y: phoneY, duration: 0.15, ease: 'power2.inOut' },
          t(0.15),
        )
        tl.fromTo(
          props.phone,
          { rotateY: -10 },
          { rotateY: 10, duration: 0.45, immediateRender: false },
          t(0.3),
        )
      }
      coreTo(
        compact
          ? { x: -0.36, y: 0.02, s: 0.04 }
          : {
              x: fx(W / 2 + targetPhoneX - phoneW / 2) - 0.07,
              y: 0.22,
              s: 0.036,
            },
        t(0.15),
        0.15,
      )
      rise(s('tchar'), t(0.15), 0.1, 0.011)
      const copy = scenes[i]?.querySelector('[data-f="copy"]')
      if (copy) enter(copy.children, t(0.22), 0.05, { x: -24, stagger: 0.025 })
      const feats = [s('feat1'), s('feat2'), s('feat3')]
      const screenStarts = [0.3, 0.46, 0.6]
      // the active feature reads at full strength, the others recede
      feats.forEach((feat, k) => {
        tl.fromTo(
          feat,
          { opacity: 0, y: 10 },
          {
            opacity: k === 0 ? 1 : 0.4,
            y: 0,
            duration: 0.06,
            ease: 'power3.out',
            immediateRender: true,
          },
          t(0.26),
        )
        if (k > 0) {
          tl.to(feat, { opacity: 1, duration: 0.03 }, t(screenStarts[k]))
          tl.to(
            feats[k - 1],
            { opacity: 0.4, duration: 0.03 },
            t(screenStarts[k]),
          )
        }
      })
      props.screens.forEach((screen, k) => {
        if (k === 0) return
        tl.fromTo(
          screen,
          { yPercent: 100 },
          {
            yPercent: 0,
            duration: 0.06,
            ease: 'power2.inOut',
            immediateRender: true,
          },
          t(screenStarts[k]),
        )
      })
      // The real "Next class" card detaches from the NOW screen, then docks
      if (props.card) {
        tl.set(props.card, { opacity: 1 }, t(0.33))
        tl.to(
          props.card,
          {
            x: compact ? 0 : -0.2 * W,
            y: compact ? -0.14 * H : -0.04 * H,
            scale: 1.12,
            rotateY: compact ? 0 : 8,
            duration: 0.05,
            ease: 'power3.out',
          },
          t(0.33),
        )
        tl.to(
          props.card,
          {
            x: 0,
            y: 0,
            scale: 1,
            rotateY: 0,
            duration: 0.04,
            ease: 'power2.inOut',
          },
          t(0.41),
        )
        tl.set(props.card, { opacity: 0 }, t(0.45))
      }
      // exit: paper contracts to a point at the Core, void returns
      const coreXp = compact
        ? 0.14
        : (W / 2 + targetPhoneX - phoneW / 2) / W - 0.07 + 0.5
      const coreYp = compact ? 0.52 : 0.72
      if (paper) {
        tl.to(
          paper,
          {
            clipPath: `inset(${(coreYp * 100).toFixed(2)}% ${((1 - coreXp) * 100).toFixed(2)}% ${((1 - coreYp) * 100).toFixed(2)}% ${(coreXp * 100).toFixed(2)}% round 50%)`,
            duration: 0.13,
            ease: 'power2.in',
          },
          t(0.86),
        )
        tl.set(paper, { autoAlpha: 0 }, t(0.995))
      }
      coreTo({ dark: 0 }, t(0.88), 0.1)
      if (props.phone)
        tl.to(props.phone, { opacity: 0, scale: 0.92, duration: 0.08 }, t(0.84))
      exit(
        [...s('title'), ...(copy ? [copy] : []), ...feats.flat()],
        t(0.84),
        0.08,
        { x: 0.1 * W },
      )
    })

    /* ── 08 Madad ── */
    const swarmX = compact ? 0 : 0.16
    const swarmY = compact ? -0.12 : -0.02
    builders.push(() => {
      const i = sceneIndex('madad')
      const t = at(i)
      const s = sel(i)
      corner(i)
      coreTo(
        { x: swarmX, y: swarmY, s: compact ? 0.11 : 0.09 },
        t(0),
        0.15,
        'power2.out',
      )
      tl.to(core, { split: 1, duration: 0.35 }, t(0.15))
      tl.to(core, { a: 0, duration: 0.08 }, t(0.17))
      tl.to(core, { edges: 1, duration: 0.2 }, t(0.4))
      tl.to(core, { dolly: 1, duration: 0.55 }, t(0.4))
      rise(s('tchar'), t(0.3), 0.1, 0.016)
      const copy = scenes[i]?.querySelector('[data-f="copy"]')
      if (copy)
        enter(copy.children, t(0.33), 0.06, { scale: 0.92, stagger: 0.025 })
      enter(s('query'), t(0.52), 0.06, { scale: 0.92 })
      enter(s('char'), t(0.55), 0.004, { stagger: 0.004, opacity: 0 }, 'none')
      s('step').forEach((step, k) => {
        tl.fromTo(
          step,
          { opacity: 0.28 },
          { opacity: 1, duration: 0.03, immediateRender: true },
          t(0.63 + k * 0.06),
        )
      })
      tl.to(core, { query: 1, duration: 0.1 }, t(0.64))
      tl.to(core, { path: 1, duration: 0.16 }, t(0.75))
      exit(
        [...s('title'), ...(copy ? [copy] : []), ...s('query')],
        t(0.92),
        0.08,
        { scale: 1.12 },
      )
    })

    /* ── 09 Under the hood ── */
    builders.push(() => {
      const i = sceneIndex('under-the-hood')
      const t = at(i)
      const s = sel(i)
      corner(i)
      tl.to(
        core,
        { stream: 1, edges: 0, query: 0, path: 0, duration: 0.12 },
        t(0),
      )
      coreTo({ x: 0, y: compact ? -0.05 : 0 }, t(0), 0.2)
      enter(s('htitle'), t(0.06), 0.06, {})
      const panes = s('pane')
      const travel = 3800
      const t0 = 0.1
      const span = 0.62
      panes.forEach((pane, k) => {
        const z0 = -(500 + k * 950)
        const x = compact ? 0 : (k % 2 === 0 ? -1 : 1) * 0.16 * W
        const y = compact
          ? (k % 2 === 0 ? -0.06 : 0.06) * H
          : (k - 1.5) * 0.06 * H
        gsap.set(pane, { x, y, z: z0, opacity: 0 })
        tl.to(pane, { z: z0 + travel, duration: span }, t(t0))
        const timeAt = (z: number) => t0 + ((z - z0) / travel) * span
        // only the next pane surfaces from the dark; the rest wait their turn
        const fadeIn = Math.max(t0, timeAt(-1350))
        const fadeOut = Math.min(t0 + span - 0.04, timeAt(250))
        tl.to(pane, { opacity: 1, duration: 0.06 }, t(fadeIn))
        tl.to(pane, { opacity: 0, duration: 0.05 }, t(fadeOut))
      })
      enter(s('foot'), t(0.68), 0.08, { y: 12 })
      tl.to(core, { stream: 0, duration: 0.1 }, t(0.7))
      tl.to(core, { split: 0, duration: 0.14, ease: 'power2.inOut' }, t(0.72))
      tl.to(core, { a: 1, dolly: 0, duration: 0.07 }, t(0.82))
      coreTo({ s: compact ? 0.07 : 0.06 }, t(0.8), 0.1)
      exit([...s('htitle'), ...s('foot')], t(0.92), 0.06)
    })

    /* ── 10 Behind the work ── */
    builders.push(() => {
      const i = sceneIndex('about')
      const t = at(i)
      const s = sel(i)
      corner(i)
      coreTo(
        compact
          ? { x: -0.3, y: -0.2, s: 0.05 }
          : { x: -0.32, y: 0.04, s: 0.045 },
        t(0),
        0.22,
        'power1.inOut',
      )
      coreTo(
        compact ? { x: 0.22, y: -0.26 } : { x: 0.1, y: -0.12 },
        t(0.25),
        0.4,
        'power1.inOut',
      )
      enter(s('portrait'), t(0.15), 0.25, { scale: 1.08 }, 'power2.out')
      enter(s('kicker'), t(0.32), 0.06, { y: 10 })
      rise(s('line'), t(0.35), 0.1, 0.08)
      enter(s('bio'), t(0.56), 0.1, { y: 16 })
      exit(
        [...s('portrait'), ...s('kicker'), ...s('line'), ...s('bio')],
        t(0.9),
        0.1,
        { scale: 0.97 },
      )
    })

    /* ── 11 Timeline ── */
    builders.push(() => {
      const i = sceneIndex('timeline')
      const t = at(i)
      const s = sel(i)
      corner(i)
      const ridge = bg('ridge')
      if (ridge) {
        tl.fromTo(
          ridge,
          { autoAlpha: 0, y: 0.08 * H },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.15,
            ease: 'power2.out',
            immediateRender: false,
          },
          t(0),
        )
        tl.to(ridge, { autoAlpha: 0, duration: 0.08 }, t(0.92))
      }
      const track = s('track').at(0)
      const items = s('ms')
      const markerX = compact && geo.line ? fx(geo.line.x + 0.5) : -0.22
      const markerY = compact ? -0.06 : 0.08
      coreTo({ x: markerX, y: markerY, s: compact ? 0.026 : 0.02 }, t(0), 0.15)
      enter([...s('ttitle'), ...s('tl')], t(0.04), 0.1, {})
      if (track && items.length > 0 && geo.milestones.length === items.length) {
        const offsets = geo.milestones
        const markerPx = compact ? H * (0.5 + markerY) : W * (0.5 + markerX)
        const layerOffset = compact ? (geo.track?.y ?? 0) : (geo.track?.x ?? 0)
        const shift = (k: number) => markerPx - layerOffset - offsets[k]
        const axis = compact ? 'y' : 'x'
        gsap.set(track, { [axis]: shift(0) })
        gsap.set(items, { opacity: 0.32 })
        const step = 0.74 / Math.max(1, items.length - 1)
        items.forEach((item, k) => {
          const time = 0.15 + k * step
          if (k > 0)
            tl.to(
              track,
              { [axis]: shift(k), duration: step * 0.7, ease: 'power2.inOut' },
              t(time - step * 0.7),
            )
          tl.to(item, { opacity: 1, duration: 0.02 }, t(time))
          if (k > 0)
            tl.to(items[k - 1], { opacity: 0.55, duration: 0.02 }, t(time))
        })
      }
      exit([...s('ttitle'), ...s('tl')], t(0.93), 0.06)
    })

    /* ── 12 Toolkit — only what the projects use ── */
    builders.push(() => {
      const i = sceneIndex('toolkit')
      const t = at(i)
      const s = sel(i)
      corner(i)
      coreTo(
        compact
          ? { x: -0.4, y: -0.02, s: 0.02 }
          : { x: -0.43, y: 0.02, s: 0.018 },
        t(0),
        0.12,
      )
      rise(s('tchar'), t(0.04), 0.1, 0.02)
      enter([...s('tkkicker'), ...s('tkbody')], t(0.06), 0.1, { y: 12 })
      const rows = s('tkrow')
      rows.forEach((row, k) => {
        const start = t(0.12 + k * 0.06)
        enter(row.querySelectorAll('[data-f="chip"]'), start, 0.12, {
          x: 0.25 * W,
          stagger: 0.008,
        })
        enter(row.querySelector('.f-tk-row__label'), start, 0.08, {})
      })
      // rows drift in opposite directions while you scroll — every chip passes the eye
      s('tktrack').forEach((track, k) => {
        // reveal whatever overflows, and always move at least a tenth of the frame
        const overflow = geo.toolkitOverflow[k] ?? 0
        const extra = Math.max(0, 0.1 * W - overflow)
        const start = extra / 2
        const end = -(overflow + extra / 2)
        const leftward = k % 2 === 0
        tl.fromTo(
          track,
          { x: leftward ? start : end },
          { x: leftward ? end : start, duration: 0.6, immediateRender: true },
          t(0.3),
        )
      })
      // the Core runs behind the rows, left to right
      coreTo(compact ? { x: 0.42 } : { x: 0.44 }, t(0.3), 0.6, 'none')
      exit(
        [...rows, ...s('tkkicker'), ...s('tkbody'), ...s('tchar')],
        t(0.92),
        0.07,
        { scale: 0.97 },
      )
    })

    /* ── 13 More work ── */
    builders.push(() => {
      const i = sceneIndex('experiments')
      const t = at(i)
      const s = sel(i)
      corner(i)
      coreTo(
        compact
          ? { x: 0.36, y: -0.34, s: 0.024 }
          : { x: -0.41, y: 0.27, s: 0.02 },
        t(0),
        0.15,
      )
      rise(s('tchar'), t(0.05), 0.1, 0.012)
      enter(s('head'), t(0.05), 0.12, {})
      if (compact) enter(s('card'), t(0.15), 0.12, { y: 30, stagger: 0.04 })
      else enter(s('card'), t(0.15), 0.2, { x: 0.6 * W, stagger: 0.05 })
      exit([...s('head'), ...s('card')], t(0.9), 0.1, { scale: 0.9 })
    })

    /* ── 13 Let's build ── */
    builders.push(() => {
      const i = sceneIndex('contact')
      const t = at(i)
      const s = sel(i)
      corner(i)
      const thumbs = s('thumb')
      thumbs.forEach((thumb, k) => {
        // drift backward into depth, converging on the centre (transform-only)
        const r = geo.thumbs[k]
        const dx = r ? W / 2 - (r.x + r.w / 2) : 0
        const dy = r ? H / 2 - (r.y + r.h / 2) : 0
        tl.fromTo(
          thumb,
          { opacity: 0 },
          { opacity: 0.85, duration: 0.05, immediateRender: true },
          t(0.01),
        )
        tl.to(
          thumb,
          {
            x: dx * 0.82,
            y: dy * 0.82,
            scale: 0.18,
            opacity: 0.25,
            duration: 0.28,
            ease: 'power2.in',
          },
          t(0.06),
        )
        tl.to(thumb, { opacity: 0, duration: 0.06 }, t(0.32))
      })
      rise(s('cline'), t(0.25), 0.12, 0.08)
      const period = geo.period
      if (period) {
        const radius = geo.periodFont * 0.1
        coreTo(
          {
            x: fx(period.x + period.w * 0.32),
            y: fy(period.y + period.h * 0.74 - radius),
            s: radius / minWH,
            e: 0.85,
          },
          t(0.45),
          0.2,
          'power3.inOut',
        )
      }
      enter(s('actions'), t(0.6), 0.12, { y: 16 })
      exit([...s('cline'), ...s('actions')], t(0.9), 0.08)
    })

    /* ── 14 Outro ── */
    builders.push(() => {
      const i = sceneIndex('outro')
      const t = at(i)
      const s = sel(i)
      const horizon = bg('horizon')
      if (horizon) {
        tl.fromTo(
          horizon,
          { autoAlpha: 0, y: 0.3 * H },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.5,
            ease: 'power2.out',
            immediateRender: false,
          },
          t(0),
        )
      }
      coreTo({ x: 0, y: 0.205, s: 0.007, e: 1 }, t(0.05), 0.45, 'power2.inOut')
      enter(s('outro'), t(0.4), 0.2, { y: 10 })
    })

    tl.set({}, {}, SCENES.length)
  }, root)

  function derive(out: CoreState) {
    Object.assign(out, core)
    if (morph.tmix > 0.001 && morph.w > 0) {
      const [px, py] = pointOnRoundedRect(morph, morph.trace % 1)
      out.x = mix(core.x, px / W - 0.5, morph.tmix)
      out.y = mix(core.y, py / H - 0.5, morph.tmix)
    }
    if (props.rect && props.trail && props.morphSvg) {
      const visible = morph.a > 0.001
      props.morphSvg.style.opacity = visible ? String(morph.a) : '0'
      if (visible) {
        for (const rect of [props.rect, props.trail]) {
          rect.setAttribute('x', (morph.cx - morph.w / 2).toFixed(1))
          rect.setAttribute('y', (morph.cy - morph.h / 2).toFixed(1))
          rect.setAttribute('width', morph.w.toFixed(1))
          rect.setAttribute('height', morph.h.toFixed(1))
          rect.setAttribute('rx', morph.r.toFixed(1))
        }
        const perimeter = roundedRectPerimeter(morph)
        const segment = perimeter * 0.16
        props.trail.style.strokeDasharray = `${segment.toFixed(1)} ${(perimeter - segment).toFixed(1)}`
        props.trail.style.strokeDashoffset = (
          -(morph.trace % 1) * perimeter +
          segment
        ).toFixed(1)
        props.trail.style.opacity = String(morph.tmix)
      }
    }
  }

  function ensure(index: number) {
    const target = Math.min(index, builders.length - 1)
    while (builtUpTo < target) {
      const builder = builders.at(++builtUpTo)
      if (builder) ctx.add(builder)
    }
  }
  ensure(1)

  return {
    tl,
    core,
    morph,
    derive,
    ensure,
    tone: (time) => {
      const paper = sceneIndex('campusflow')
      return time > paper + 0.06 && time < paper + 0.9 ? 'light' : 'dark'
    },
    kill() {
      tl.kill()
      ctx.revert()
    },
  }
}

const mix = (a: number, b: number, t: number) => a + (b - a) * t

function roundedRectPerimeter(m: MorphState) {
  const r = Math.min(m.r, m.w / 2, m.h / 2)
  return 2 * (m.w - 2 * r) + 2 * (m.h - 2 * r) + 2 * Math.PI * r
}

/** Point at fraction u (0..1) along a rounded rect's outline, clockwise from top-left */
export function pointOnRoundedRect(m: MorphState, u: number): [number, number] {
  const r = Math.min(m.r, m.w / 2, m.h / 2)
  const left = m.cx - m.w / 2
  const top = m.cy - m.h / 2
  const straightW = m.w - 2 * r
  const straightH = m.h - 2 * r
  const arc = (Math.PI * r) / 2
  const segments: Array<[number, (d: number) => [number, number]]> = [
    [straightW, (d) => [left + r + d, top]],
    [arc, (d) => arcPoint(left + m.w - r, top + r, r, -Math.PI / 2 + d / r)],
    [straightH, (d) => [left + m.w, top + r + d]],
    [arc, (d) => arcPoint(left + m.w - r, top + m.h - r, r, d / r)],
    [straightW, (d) => [left + m.w - r - d, top + m.h]],
    [arc, (d) => arcPoint(left + r, top + m.h - r, r, Math.PI / 2 + d / r)],
    [straightH, (d) => [left, top + m.h - r - d]],
    [arc, (d) => arcPoint(left + r, top + r, r, Math.PI + d / r)],
  ]
  let distance = (((u % 1) + 1) % 1) * roundedRectPerimeter(m)
  for (const [length, at] of segments) {
    if (distance <= length) return at(distance)
    distance -= length
  }
  return [left + r, top]
}

function arcPoint(
  cx: number,
  cy: number,
  r: number,
  angle: number,
): [number, number] {
  return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r]
}
