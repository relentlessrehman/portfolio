/*
 * Film runtime — lazy chunk loaded after hydration (Performance §3).
 *
 *   wheel / touch ─► scroll-control (speed cap, stops) ─► Lenis ─► scrollY
 *   scrollY ─► filmTime() ─► tl.time(T)  (DOM choreography + Core state)
 *          ─► derive() ─► GL stage (damped, render-on-demand)
 *
 * One RAF (gsap.ticker). No React state on scroll. The first frame is pure
 * CSS, so building the timeline waits for idle time or the first sign of
 * intent — it never competes with first paint. dispose() undoes everything.
 */
import gsap from 'gsap'
import Lenis from 'lenis'
import { SCENES, holdOf, sceneIndexById } from '../config/scenes'
import {
  buildFilm,
  initialCore
  
  
} from './choreography'
import type {Built, CoreState} from './choreography';
import {
  filmTime,
  scrollFor,
  scrolledPastFilm,
  splitTime
  
} from './progress'
import type {SceneMetric} from './progress';
import { createScrollControl  } from './scroll-control'
import type {ScrollControl} from './scroll-control';
import type { FilmMode } from './mode'
import type { Stage } from '../gl/stage'

const NAV_REVEAL_AT = 0.85

export function bootFilm(root: HTMLElement, mode: FilmMode): () => void {
  const html = document.documentElement
  const params = new URLSearchParams(window.location.search)
  const debug = params.has('hud')
  const freeze = params.has('freeze')
  const sections = [...root.querySelectorAll<HTMLElement>('.f-scene')]
  const fixedLayers = [
    ...root.querySelectorAll<HTMLElement>('[data-film-fixed]'),
  ]
  const railLinks = [...root.querySelectorAll<HTMLAnchorElement>('[data-rail]')]
  const glHost = root.querySelector<HTMLElement>('[data-gl]')
  const poster = root.querySelector<HTMLElement>('[data-p="poster"]')

  let metrics: Array<SceneMetric> = []
  let built: Built | null = null
  let started = false
  let time = -1
  let past = -1
  let view = { width: window.innerWidth, height: window.innerHeight }
  let compact = view.width < 600
  let stage: Stage | null = null
  let glReady = false
  let disposed = false
  const renderState: CoreState = initialCore(compact)

  /* ── Directed scrolling: the film sets the pace (wheel AND touch) ── */
  const lenis = freeze
    ? null
    : new Lenis({
        autoRaf: false,
        lerp: 0.085,
        wheelMultiplier: 0.85,
        syncTouch: true,
        syncTouchLerp: 0.09,
        // film mode is already the visitor's motion choice (Motion toggle / OS setting)
        respectReducedMotion: false,
      })
  const control: ScrollControl | null = lenis
    ? createScrollControl(lenis, () => view.height)
    : null
  const onLenisFrame = (seconds: number) => lenis?.raf(seconds * 1000)
  if (lenis) gsap.ticker.add(onLenisFrame)
  gsap.ticker.lagSmoothing(0)
  html.classList.add('film-active')

  /* ── Measure + build ─────────────────────────────────────────── */
  function measure() {
    const layer = root.querySelector<HTMLElement>('.f-layer')
    const layerHeight = layer?.offsetHeight ?? window.innerHeight
    view = { width: root.clientWidth || window.innerWidth, height: layerHeight }
    compact = view.width < 600
    metrics = sections.map((section) => ({
      top: section.getBoundingClientRect().top + window.scrollY,
      len: Math.max(1, section.offsetHeight - layerHeight),
    }))
    control?.setStops(
      SCENES.flatMap((scene, index) =>
        scene.stops.map((p) => scrollFor(index, p, metrics)),
      ),
    )
    lenis?.resize()
  }

  function build() {
    built?.kill()
    measure()
    built = buildFilm({ root, W: view.width, H: view.height, compact })
    time = -1
    tick(true)
  }

  /* ── The frame ───────────────────────────────────────────────── */
  const frameTimes: Array<number> = []
  let lastFrame = performance.now()
  let lastDegrade = 0
  let hud: HTMLElement | null = null

  function tick(force = false) {
    if (!built) return
    const now = performance.now()
    const scrollY = window.scrollY
    const t = filmTime(scrollY, metrics)
    const changed = t !== time
    if (changed || force) {
      time = t
      // build this scene and the next one before rendering them (lazy scenes)
      built.ensure(Math.floor(t) + 1)
      built.tl.time(t, true)
      built.derive(renderState)
      updateChrome(t)
    }
    const shift = scrolledPastFilm(scrollY, metrics)
    if (shift !== past) {
      past = shift
      // after the last scene, fixed layers travel up with the credits
      const transform = shift > 0 ? `translate3d(0, ${-shift}px, 0)` : ''
      for (const layer of fixedLayers) layer.style.transform = transform
    }
    if (!glReady && poster) placePoster()
    if (stage && glReady && shift < view.height) {
      const drew = stage.render(renderState, view, now, changed || force)
      if (drew) trackFrame(now)
    }
    lastFrame = now
    if (debug) drawHud(t)
  }

  function trackFrame(now: number) {
    const dt = now - lastFrame
    // hidden/throttled tabs and one-off stalls (GC, tab switch) aren't jank
    if (document.hidden || dt <= 0 || dt > 120) return
    frameTimes.push(dt)
    if (frameTimes.length > 120) frameTimes.shift()
    // Runtime quality ladder (Performance §5): p75 over budget for 2s → step down
    const budget = window.matchMedia('(pointer: coarse)').matches ? 25 : 20
    if (frameTimes.length >= 90 && now - lastDegrade > 3000) {
      const sorted = [...frameTimes].sort((a, b) => a - b)
      const p75 = sorted[Math.floor(sorted.length * 0.75)]
      if (p75 > budget) {
        lastDegrade = now
        frameTimes.length = 0
        if (stage && !stage.degrade()) teardownGL()
      }
    }
  }

  function placePoster() {
    if (!poster) return
    const r = renderState
    const size = r.s * Math.min(view.width, view.height) * 2
    poster.style.width = `${size}px`
    poster.style.height = `${size}px`
    poster.style.transform = `translate3d(${(0.5 + r.x) * view.width - size / 2}px, ${(0.5 + r.y) * view.height - size / 2}px, 0)`
    poster.style.opacity =
      r.a > 0.5 && r.split < 0.05 && r.dark < 0.5 && r.e < 0.5 ? '1' : '0'
  }

  /* ── Chrome: nav reveal, chapter rail, tone, current scene ───── */
  let navShown = html.dataset.nav !== 'hidden'
  let activeAct = ''
  let currentScene = 0 // the intro is server-rendered as current
  let tone = ''
  function updateChrome(t: number) {
    const shouldShow = t >= NAV_REVEAL_AT
    if (shouldShow !== navShown) {
      navShown = shouldShow
      html.dataset.nav = shouldShow ? 'shown' : 'hidden'
      if (shouldShow) markIntroSeen()
    }
    const { index } = splitTime(t, SCENES.length)
    if (index !== currentScene) {
      sections[currentScene]?.removeAttribute('data-current')
      sections[index]?.setAttribute('data-current', '')
      currentScene = index
    }
    const act = SCENES[index]?.act ?? 'arrival'
    if (act !== activeAct) {
      activeAct = act
      for (const link of railLinks)
        link.toggleAttribute('data-active', link.dataset.rail === act)
    }
    const nextTone = built?.tone(t) ?? 'dark'
    if (nextTone !== tone) {
      tone = nextTone
      html.dataset.tone = nextTone
    }
  }
  function markIntroSeen() {
    try {
      sessionStorage.setItem('intro-seen', '1')
    } catch {
      /* ignore */
    }
  }

  /* ── Navigation inside the film ──────────────────────────────── */
  function jumpTo(target: number, immediate: boolean) {
    if (lenis) {
      const distance = Math.abs(target - window.scrollY)
      lenis.scrollTo(
        target,
        immediate
          ? { immediate: true }
          : { duration: Math.min(1.6, Math.max(0.6, distance / 3000)) },
      )
    } else {
      window.scrollTo({ top: target, behavior: 'instant' as ScrollBehavior })
    }
  }

  function scrollToScene(id: string, immediate = false) {
    const index = sceneIndexById.get(id)
    if (index === undefined) return false
    jumpTo(scrollFor(index, holdOf(SCENES[index]), metrics), immediate)
    return true
  }

  function onClick(event: MouseEvent) {
    const anchor =
      event.target instanceof Element
        ? event.target.closest('a[href^="#"], a[href^="/#"]')
        : null
    if (!anchor) return
    const id = anchor.getAttribute('href')!.split('#')[1]
    if (id && sceneIndexById.has(id)) {
      event.preventDefault()
      ensureStarted()
      scrollToScene(id)
      history.replaceState(null, '', `#${id}`)
    }
  }

  // Focus-follow: a focused link is always on screen and revealed (Engineering §7)
  function onFocusIn(event: FocusEvent) {
    const target = event.target as HTMLElement | null
    const section = target?.closest<HTMLElement>('.f-scene')
    if (!target || !section) return
    const index = sections.indexOf(section)
    const scene = SCENES.at(index)
    const beat = Number(
      target.closest<HTMLElement>('[data-beat]')?.dataset.beat ??
        (scene ? holdOf(scene) : 0.5),
    )
    const current = filmTime(window.scrollY, metrics)
    if (Math.floor(current) !== index || current - index < beat)
      jumpTo(scrollFor(index, beat, metrics), true)
  }

  /* ── Resize: re-measure and rebuild (debounced) ──────────────── */
  let resizeTimer = 0
  let lastWidth = window.innerWidth
  let lastHeight = window.innerHeight
  function onResize() {
    const width = window.innerWidth
    const height = window.innerHeight
    // ignore mobile URL-bar show/hide (height-only changes < 20%)
    if (width === lastWidth && Math.abs(height - lastHeight) / lastHeight < 0.2)
      return
    lastWidth = width
    lastHeight = height
    window.clearTimeout(resizeTimer)
    resizeTimer = window.setTimeout(() => {
      const keep = splitTime(Math.max(0, time), SCENES.length)
      build()
      stage?.resize()
      jumpTo(scrollFor(keep.index, keep.p, metrics), true)
    }, 150)
  }

  // Gentle pointer parallax on the Core (fine pointers only, Design §5.3)
  const finePointer = window.matchMedia('(pointer: fine)').matches
  function onPointerMove(event: PointerEvent) {
    if (!finePointer || event.pointerType !== 'mouse') return
    stage?.setPointer(
      event.clientX / window.innerWidth - 0.5,
      event.clientY / window.innerHeight - 0.5,
    )
  }
  window.addEventListener('pointermove', onPointerMove, { passive: true })

  const onTick = () => tick(false)
  const onVisibility = () => {
    if (document.hidden) gsap.ticker.remove(onTick)
    else if (started) {
      frameTimes.length = 0
      gsap.ticker.add(onTick)
    }
  }

  /* ── WebGL: never competes with first paint ──────────────────── */
  function loadGL() {
    if (!glHost || disposed) return
    import('../gl/stage')
      .then(async ({ createStage }) => {
        if (disposed) return
        const created = createStage(glHost, mode)
        stage = created
        created.canvas.addEventListener('webglcontextlost', (event) => {
          event.preventDefault()
          teardownGL()
        })
        await created.ready
        // disposal or a context loss can happen while shaders compile
        const stale = () => disposed || stage !== created
        if (stale()) return
        glReady = true
        glHost.dataset.ready = 'true'
        if (poster) poster.style.opacity = '0'
        tick(true)
      })
      .catch(() => teardownGL())
  }
  function teardownGL() {
    glReady = false
    stage?.dispose()
    stage = null
    if (glHost) delete glHost.dataset.ready
    placePoster()
  }

  /* ── HUD (?hud) ──────────────────────────────────────────────── */
  function drawHud(t: number) {
    if (!hud) {
      hud = document.createElement('pre')
      hud.className = 'f-hud'
      document.body.appendChild(hud)
    }
    const sorted = [...frameTimes].sort((a, b) => a - b)
    const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? 0
    const avg =
      sorted.reduce((sum, v) => sum + v, 0) / Math.max(1, sorted.length)
    const { index, p } = splitTime(t, SCENES.length)
    const info = stage?.info()
    hud.textContent = `T ${t.toFixed(3)}  ${SCENES[index]?.index} ${SCENES[index]?.id} p=${p.toFixed(2)}
mode ${mode}  gl ${glReady ? 'on' : 'off'}  dpr ${info?.dpr.toFixed(2) ?? '-'}  rung ${info?.rung ?? '-'}
frame avg ${avg.toFixed(1)}ms  p95 ${p95.toFixed(1)}ms  (${sorted.length})`
  }

  /* ── Boot ────────────────────────────────────────────────────── */
  // The timeline is built once, after the display font (its metrics decide every
  // measured anchor) and after the browser goes idle — or immediately on intent.
  let fontsLoaded = document.fonts.status === 'loaded'
  void Promise.race([
    document.fonts.ready,
    new Promise((r) => window.setTimeout(r, 1500)),
  ]).then(() => {
    fontsLoaded = true
    scheduleIdleStart()
  })

  const intentEvents = [
    'wheel',
    'touchstart',
    'keydown',
    'pointerdown',
  ] as const
  function onIntent() {
    ensureStarted()
    requestGL()
  }
  for (const type of intentEvents)
    window.addEventListener(type, onIntent, { passive: true, capture: true })

  let idleHandle = 0
  function scheduleIdleStart() {
    if (started || disposed) return
    // Safari has no requestIdleCallback
    if ('requestIdleCallback' in globalThis)
      idleHandle = window.requestIdleCallback(ensureStarted, { timeout: 2500 })
    else idleHandle = window.setTimeout(ensureStarted, 800)
  }
  if (fontsLoaded) scheduleIdleStart()

  let glRequested = false
  function requestGL() {
    if (glRequested || disposed) return
    glRequested = true
    // intent listeners stay until WebGL is requested (the film may have started on idle)
    for (const type of intentEvents)
      window.removeEventListener(type, onIntent, { capture: true })
    window.clearTimeout(glTimer)
    loadGL()
  }
  // fallback well after the startup window, for visitors who just watch the first frame
  const glTimer = window.setTimeout(requestGL, 8000)

  function ensureStarted() {
    if (started || disposed) return
    started = true
    build()
    const hash = window.location.hash.slice(1)
    const pParam = params.get('p')
    if (pParam !== null) {
      const { index, p } = splitTime(Number(pParam), SCENES.length)
      jumpTo(scrollFor(index, p, metrics), true)
    } else if (hash && sceneIndexById.has(hash)) {
      scrollToScene(hash, true)
    }
    tick(true)
    gsap.ticker.add(onTick)
    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVisibility)
    root.addEventListener('focusin', onFocusIn)
    if (window.scrollY > 0 || hash || pParam !== null) requestGL()
    // Deterministic frame access for screenshots / visual regression (?hud or ?freeze only)
    if (debug || freeze) {
      ;(window as Window & { __film?: unknown }).__film = {
        seek(t: number) {
          const { index, p } = splitTime(t, SCENES.length)
          jumpTo(scrollFor(index, p, metrics), true)
        },
        time: () => time,
      }
    }
  }
  root.addEventListener('click', onClick)

  return () => {
    disposed = true
    window.clearTimeout(glTimer)
    window.clearTimeout(idleHandle)
    if ('cancelIdleCallback' in globalThis) window.cancelIdleCallback(idleHandle)
    for (const type of intentEvents)
      window.removeEventListener(type, onIntent, { capture: true })
    gsap.ticker.remove(onTick)
    control?.dispose()
    if (lenis) {
      gsap.ticker.remove(onLenisFrame)
      lenis.destroy()
    }
    window.removeEventListener('resize', onResize)
    window.removeEventListener('pointermove', onPointerMove)
    document.removeEventListener('visibilitychange', onVisibility)
    root.removeEventListener('click', onClick)
    root.removeEventListener('focusin', onFocusIn)
    window.clearTimeout(resizeTimer)
    built?.kill()
    built = null
    stage?.dispose()
    stage = null
    for (const layer of fixedLayers) layer.style.transform = ''
    hud?.remove()
    html.classList.remove('film-active')
    for (const section of sections) section.removeAttribute('data-current')
    sections[0]?.setAttribute('data-current', '')
    html.dataset.nav = 'shown'
    delete html.dataset.tone
  }
}
