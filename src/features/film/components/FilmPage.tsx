import { useEffect, useRef, useState } from 'react'
import { ACT_STARTS } from '../config/scenes'
import {
  MOTION_CHANGE_EVENT,
  currentFilmMode,
  readMotionPreference,
  resolveFilmMode,
} from '../engine/mode'
import type { FilmMode } from '../engine/mode'
import { FilmBackdrop, FilmProps } from './Props'
import {
  AboutScene,
  CampusFlowScene,
  ContactScene,
  DropScene,
  ExperimentsScene,
  IdentityScene,
  IntroScene,
  MadadScene,
  OutroScene,
  StayzaDetailScene,
  StayzaScene,
  TimelineScene,
  ToolkitScene,
  ToMobileScene,
  UnderTheHoodScene,
} from './Scenes'

/**
 * The home page: a short film whose playhead is the scroll position.
 * All text is server-rendered in reading order; the film engine (GSAP + Lenis)
 * and the WebGL Core load afterwards and only enhance it. Without JS, with
 * reduced motion, or with Motion off, the same markup renders as an
 * editorial page (`static` mode).
 */
export function FilmPage() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<FilmMode | null>(null)

  useEffect(() => {
    setMode(currentFilmMode())
    const onMotion = (event: Event) =>
      setMode((event as CustomEvent<FilmMode>).detail)
    // Follow the OS setting live unless the visitor chose explicitly
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onMedia = () => {
      if (readMotionPreference() !== null) return
      const next = resolveFilmMode()
      document.documentElement.dataset.film = next
      setMode(next)
    }
    window.addEventListener(MOTION_CHANGE_EVENT, onMotion)
    media.addEventListener('change', onMedia)
    return () => {
      window.removeEventListener(MOTION_CHANGE_EVENT, onMotion)
      media.removeEventListener('change', onMedia)
    }
  }, [])

  useEffect(() => {
    const html = document.documentElement
    if (mode === null) return
    if (mode === 'static' || !rootRef.current) {
      html.dataset.nav = 'shown'
      return
    }
    let dispose: (() => void) | undefined
    let cancelled = false
    import('../engine/runtime')
      .then(({ bootFilm }) => {
        if (!cancelled && rootRef.current)
          dispose = bootFilm(rootRef.current, mode)
      })
      .catch(() => {
        // the engine failed to load: fall back to the editorial page
        html.dataset.film = 'static'
        html.dataset.nav = 'shown'
        if (!cancelled) setMode('static')
      })
    return () => {
      cancelled = true
      dispose?.()
      html.dataset.nav = 'shown'
    }
  }, [mode])

  return (
    <div className="film" ref={rootRef}>
      <nav className="f-skip" aria-label="Skip the film">
        <a href="#stayza">Skip to work</a>
        <a href="#contact">Skip to contact</a>
      </nav>

      <nav className="f-rail film-only" aria-label="Chapters">
        <ol>
          {ACT_STARTS.map((act, index) => (
            <li key={act.id}>
              <a href={`#${act.sceneId}`} data-rail={act.id}>
                <span className="f-rail__num">0{index + 1}</span>
                <span className="f-rail__name">{act.label}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <FilmBackdrop />
      <FilmProps />
      <div className="f-canvas film-only" data-gl data-film-fixed aria-hidden />
      <div className="f-vignette film-only" data-film-fixed aria-hidden />
      <div className="f-grain film-only" aria-hidden />

      <IntroScene />
      <IdentityScene />
      <DropScene />
      <StayzaScene />
      <StayzaDetailScene />
      <ToMobileScene />
      <CampusFlowScene />
      <MadadScene />
      <UnderTheHoodScene />
      <AboutScene />
      <TimelineScene />
      <ToolkitScene />
      <ExperimentsScene />
      <ContactScene />
      <OutroScene />
    </div>
  )
}
