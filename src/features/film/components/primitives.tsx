import { Fragment } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { cn } from '#/lib/utils'
import { SCENES, sceneIndexById } from '../config/scenes'

/** Responsive AVIF/WebP image built by scripts/film-assets.mjs */
export function Pic({
  name,
  widths,
  sizes,
  alt = '',
  ratio,
  className,
  eager = false,
}: {
  name: string
  widths: ReadonlyArray<number>
  sizes: string
  alt?: string
  /** width / height of the source, reserves layout space */
  ratio: number
  className?: string
  eager?: boolean
}) {
  const srcset = (format: string) =>
    widths
      .map((width) => `/film/${name}-${width}.${format} ${width}w`)
      .join(', ')
  const largest = widths[widths.length - 1] ?? 800
  return (
    <picture className={cn('f-pic', className)}>
      <source type="image/avif" srcSet={srcset('avif')} sizes={sizes} />
      <img
        src={`/film/${name}-${widths[0]}.webp`}
        srcSet={srcset('webp')}
        sizes={sizes}
        alt={alt}
        width={largest}
        height={Math.round(largest / ratio)}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
      />
    </picture>
  )
}

/** The Core as a still CSS render — static mode, poster, brand mark */
export function Orb({
  className,
  style,
}: {
  className?: string
  style?: CSSProperties
}) {
  return <span className={cn('f-orb', className)} style={style} aria-hidden />
}

export function Label({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <p className={cn('f-label', className)}>{children}</p>
}

/** "04. STAYZA" corner furniture */
export function Corner({ sceneId }: { sceneId: string }) {
  const scene = SCENES.at(sceneIndexById.get(sceneId) ?? 0)
  return (
    <p className="f-label f-corner" data-f="corner" aria-hidden>
      <span className="f-corner__index">{scene?.index}.</span> {scene?.name}
    </p>
  )
}

/**
 * A scene: one <section> with a back layer (text the Core passes in front of)
 * and a front layer (text/UI above the Core). See Engineering §4.
 */
export function Scene({
  id,
  className,
  labelledBy,
  back,
  front,
  current = false,
}: {
  id: string
  className?: string
  /** Server-rendered as the visible scene (the intro) so the first frame never waits for JS */
  current?: boolean
  labelledBy: string
  back?: ReactNode
  front?: ReactNode
}) {
  const scene = SCENES.at(sceneIndexById.get(id) ?? 0)
  return (
    <section
      id={id}
      data-scene={id}
      aria-labelledby={labelledBy}
      data-current={current ? '' : undefined}
      className={cn('f-scene', `f-scene--${id}`, className)}
      style={
        {
          '--len-d': scene?.length.d,
          '--len-m': scene?.length.m,
        } as CSSProperties
      }
    >
      <div className="f-layer f-layer--back" data-layer="back">
        <div className="f-frame">{back}</div>
      </div>
      <div className="f-layer f-layer--front" data-layer="front">
        <div className="f-frame">{front}</div>
      </div>
    </section>
  )
}

/**
 * Text that rises from behind a mask — the film's typographic reveal.
 * `by="char"` keeps letters of a word together (no mid-word breaks); `line`
 * treats the whole string as one unit. Assistive tech reads one clean string.
 */
export function Mask({
  text,
  by = 'word',
  f,
  className,
}: {
  text: string
  by?: 'char' | 'word' | 'line'
  /** data-f hook the choreography animates (the inner, moving spans) */
  f: string
  className?: string
}) {
  const words = by === 'line' ? [text] : text.split(' ')
  return (
    <span className={cn('f-masktext', className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden className="f-masktext__vis">
        {words.map((word, w) => (
          // the space lives between word boxes — inside an inline-block it would collapse
          <Fragment key={w}>
            <span className="f-mask-word">
              {by === 'char' ? (
                [...word].map((char, c) => (
                  <span key={c} className="f-mask">
                    <span className="f-mask__in" data-f={f}>
                      {char}
                    </span>
                  </span>
                ))
              ) : (
                <span className="f-mask">
                  <span className="f-mask__in" data-f={f}>
                    {word}
                  </span>
                </span>
              )}
            </span>
            {w < words.length - 1 ? ' ' : null}
          </Fragment>
        ))}
      </span>
    </span>
  )
}

/** Splits a sentence into word spans for per-word reveals, with one clean string for AT */
export function Words({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  const words = text.split(' ')
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((word, index) => (
          <span key={index} className="f-word-unit" data-f="word">
            {word}
            {index < words.length - 1 ? ' ' : ''}
          </span>
        ))}
      </span>
    </span>
  )
}

export function Arrow({ external = false }: { external?: boolean }) {
  return (
    <span className="f-arrow" aria-hidden>
      {external ? '↗' : '→'}
    </span>
  )
}
