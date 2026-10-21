import {
  Fragment,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import type { Variants } from 'motion/react'
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react'
import type { LiquidField, Pose } from './liquid-field'

export interface SlideDef {
  id: string
  /** short name for the top bar */
  label: string
  pose: Pose
  notes?: string
  render: () => ReactNode
}

const EASE_OUT = [0.22, 1, 0.36, 1] as const

/** +1 going forward, -1 going back: reveals move with the direction of travel */
const DirContext = createContext(1)

/** Parent of every slide: staggers the reveals of its children. */
const slideVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.24 } },
  exit: { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
}

/** A block that rises out of a soft blur, like condensation clearing. */
export const revealVariants: Variants = {
  hidden: (dir: number) => ({
    opacity: 0,
    y: `${dir * 2.4}cqh`,
    filter: 'blur(10px)',
  }),
  show: {
    opacity: 1,
    y: '0cqh',
    filter: 'blur(0px)',
    transition: { duration: 0.95, ease: EASE_OUT },
  },
  exit: (dir: number) => ({
    opacity: 0,
    y: `${dir * -1.4}cqh`,
    filter: 'blur(8px)',
    transition: { duration: 0.34, ease: [0.4, 0, 1, 1] },
  }),
}

/** Wrap anything that should take part in a slide's staggered reveal. */
export function R({
  children,
  className,
  style,
  as = 'div',
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
  as?: 'div' | 'p' | 'li' | 'span' | 'ul'
}) {
  const Comp = motion[as]
  const dir = useContext(DirContext)
  return (
    <Comp
      className={className}
      style={style}
      variants={revealVariants}
      custom={dir}
    >
      {children}
    </Comp>
  )
}

const wordVariants: Variants = {
  hidden: (dir: number) => ({ y: dir >= 0 ? '108%' : '-108%' }),
  show: { y: '0%', transition: { duration: 1.05, ease: EASE_OUT } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
}

/** Headline that rises word by word from behind a mask (never per letter). */
export function Rise({
  text,
  className,
  as = 'h2',
}: {
  text: string
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'p'
}) {
  const Comp = motion[as]
  const dir = useContext(DirContext)
  return (
    <Comp
      className={className}
      variants={{ show: { transition: { staggerChildren: 0.055 } } }}
      aria-label={text}
    >
      {text.split(' ').map((word, i, words) => (
        <Fragment key={`${word}-${i}`}>
          <span className="rise-mask" aria-hidden>
            <motion.span
              className="rise-word"
              variants={wordVariants}
              custom={dir}
            >
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </Comp>
  )
}

export function Deck({ slides }: { slides: ReadonlyArray<SlideDef> }) {
  const reduced = useReducedMotion() ?? false
  const [index, setIndex] = useState(0)
  const [dir, setDir] = useState(1)
  const [boot, setBoot] = useState(0)
  const [stats, setStats] = useState<string | null>(null)
  const [idle, setIdle] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fieldRef = useRef<LiquidField | null>(null)
  const indexRef = useRef(0)
  const lockRef = useRef(0)

  const go = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(slides.length - 1, next))
      if (clamped === indexRef.current) return
      setDir(clamped > indexRef.current ? 1 : -1)
      indexRef.current = clamped
      setIndex(clamped)
      history.replaceState(null, '', `#${clamped + 1}`)
    },
    [slides.length],
  )

  // Deep link: #4 opens on the fourth slide
  useEffect(() => {
    const fromHash = parseInt(window.location.hash.slice(1), 10)
    if (fromHash >= 1 && fromHash <= slides.length) {
      indexRef.current = fromHash - 1
      setIndex(fromHash - 1)
      // remount the presence so the server-rendered first slide never animates out
      setBoot((n) => n + 1)
    }
  }, [slides.length])

  // The droplets: client-only, loaded after first paint
  useEffect(() => {
    let disposed = false
    const canvas = canvasRef.current
    if (!canvas) return
    import('./liquid-field')
      .then(({ createLiquidField }) => {
        if (disposed) return
        try {
          const field = createLiquidField(canvas, { reducedMotion: reduced })
          field.setPose(slides[indexRef.current].pose, true)
          fieldRef.current = field
        } catch {
          // no WebGL: the slides stand on their own
        }
      })
      .catch(() => {})
    return () => {
      disposed = true
      fieldRef.current?.dispose()
      fieldRef.current = null
    }
  }, [reduced, slides])

  useEffect(() => {
    fieldRef.current?.setPose(slides[index].pose)
  }, [index, slides])

  // ?fps shows the frame rate, to check the classroom laptop before presenting
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has('fps')) return
    const timer = window.setInterval(() => {
      const s = fieldRef.current?.stats()
      if (s) setStats(`${s.fps} fps · ${Math.round(s.quality * 100)}% res`)
    }, 500)
    return () => window.clearInterval(timer)
  }, [])

  // The deck is a light, full-screen world of its own
  useEffect(() => {
    const html = document.documentElement
    const previous = html.style.colorScheme
    html.style.colorScheme = 'light'
    html.dataset.deck = ''
    return () => {
      html.style.colorScheme = previous
      delete html.dataset.deck
    }
  }, [])

  // Keyboard and presentation clickers (which send PageUp / PageDown)
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const i = indexRef.current
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
        case 'Enter':
          event.preventDefault()
          go(i + 1)
          break
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
        case 'Backspace':
          event.preventDefault()
          go(i - 1)
          break
        case 'Home':
          go(0)
          break
        case 'End':
          go(slides.length - 1)
          break
        case 'f':
        case 'F':
          toggleFullscreen()
          break
        default:
          if (/^[0-9]$/.test(event.key)) {
            const n = event.key === '0' ? 10 : Number(event.key)
            go(n - 1)
          }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, slides.length])

  // Trackpad and wheel: one slide per gesture
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    let acc = 0
    function onWheel(event: WheelEvent) {
      event.preventDefault()
      const now = performance.now()
      if (now < lockRef.current) return
      acc +=
        Math.abs(event.deltaY) > Math.abs(event.deltaX)
          ? event.deltaY
          : event.deltaX
      if (Math.abs(acc) > 50) {
        go(indexRef.current + (acc > 0 ? 1 : -1))
        acc = 0
        lockRef.current = now + 900
      }
    }
    root.addEventListener('wheel', onWheel, { passive: false })
    return () => root.removeEventListener('wheel', onWheel)
  }, [go])

  // Swipe on touch screens
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    let startX = 0
    let startY = 0
    function onDown(event: PointerEvent) {
      if (event.pointerType !== 'touch') return
      startX = event.clientX
      startY = event.clientY
    }
    function onUp(event: PointerEvent) {
      if (event.pointerType !== 'touch') return
      const dx = event.clientX - startX
      const dy = event.clientY - startY
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        go(indexRef.current + (dx < 0 ? 1 : -1))
      }
    }
    root.addEventListener('pointerdown', onDown)
    root.addEventListener('pointerup', onUp)
    return () => {
      root.removeEventListener('pointerdown', onDown)
      root.removeEventListener('pointerup', onUp)
    }
  }, [go])

  // Pointer: a little parallax for the droplets, and chrome that hides while presenting
  useEffect(() => {
    let timer = 0
    function wake() {
      setIdle(false)
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setIdle(true), 2600)
    }
    function onMove(event: PointerEvent) {
      wake()
      const stage = stageRef.current
      if (!stage) return
      const rect = stage.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const y = ((event.clientY - rect.top) / rect.height) * 2 - 1
      fieldRef.current?.setPointer(x, -y)
    }
    wake()
    window.addEventListener('pointermove', onMove)
    window.addEventListener('keydown', wake)
    window.addEventListener('pointerdown', wake)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('keydown', wake)
      window.removeEventListener('pointerdown', wake)
    }
  }, [])

  useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  function toggleFullscreen() {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void rootRef.current?.requestFullscreen().catch(() => {})
  }

  const slide = slides[index]

  return (
    <div ref={rootRef} className="deck" data-idle={idle || undefined}>
      <div className="deck__aura" aria-hidden />
      <p className="deck__rotate">
        Turn your phone sideways for the full view.
      </p>
      {stats ? <output className="deck__fps">{stats}</output> : null}
      <div ref={stageRef} className="deck__stage">
        <canvas ref={canvasRef} className="deck__field" aria-hidden />

        <DirContext.Provider value={dir}>
          <AnimatePresence key={boot} initial={false} custom={dir}>
            <motion.section
              key={slide.id}
              className="slide"
              custom={dir}
              variants={slideVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${slides.length}: ${slide.label}`}
            >
              {slide.render()}
            </motion.section>
          </AnimatePresence>
        </DirContext.Provider>
      </div>

      <nav className="deck__nav" aria-label="Slides">
        <button
          type="button"
          className="deck__btn"
          onClick={() => go(index - 1)}
          disabled={index === 0}
          aria-label="Previous slide"
        >
          <ChevronLeft size={18} strokeWidth={1.75} />
        </button>
        <ol className="deck__dots">
          {slides.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                className="deck__dotbtn"
                onClick={() => go(i)}
                aria-label={`Slide ${i + 1}: ${s.label}`}
                aria-current={i === index ? 'step' : undefined}
              >
                {i === index ? (
                  <motion.span
                    layoutId="deck-active"
                    className="deck__pip deck__pip--on"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                ) : (
                  <span className="deck__pip" />
                )}
              </button>
            </li>
          ))}
        </ol>
        <span className="deck__count" aria-live="polite">
          {String(index + 1).padStart(2, '0')} /{' '}
          {String(slides.length).padStart(2, '0')}
        </span>
        <button
          type="button"
          className="deck__btn"
          onClick={() => go(index + 1)}
          disabled={index === slides.length - 1}
          aria-label="Next slide"
        >
          <ChevronRight size={18} strokeWidth={1.75} />
        </button>
        <span className="deck__sep" aria-hidden />
        <button
          type="button"
          className="deck__btn"
          onClick={toggleFullscreen}
          aria-label={fullscreen ? 'Exit full screen' : 'Full screen'}
        >
          {fullscreen ? (
            <Minimize2 size={16} strokeWidth={1.75} />
          ) : (
            <Maximize2 size={16} strokeWidth={1.75} />
          )}
        </button>
      </nav>
    </div>
  )
}
