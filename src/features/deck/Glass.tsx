import { useEffect, useId, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { cn } from '#/lib/utils'

/**
 * Liquid glass, the way Apple draws it: the backdrop is blurred, then bent at
 * the bevel by a displacement map shaped like the pane itself, so whatever is
 * behind (the droplets, the light) visibly refracts at the edges. A lit rim,
 * a top sheen and a cursor-following highlight sit on top.
 *
 * Refraction (`backdrop-filter: url()`) is Chromium-only; other engines get
 * the same pane with a plain blur, which still reads as glass.
 */

const supportsRefraction = (() => {
  if (typeof navigator === 'undefined') return false
  const brands = (
    navigator as Navigator & {
      userAgentData?: { brands: Array<{ brand: string }> }
    }
  ).userAgentData?.brands
  return !!brands?.some((b) => b.brand === 'Chromium')
})()

/** Encode an inward-pointing lens displacement for a rounded rectangle. */
function displacementMap(w: number, h: number, radius: number, bevel: number) {
  const scale = 0.5
  const cw = Math.max(2, Math.round(w * scale))
  const ch = Math.max(2, Math.round(h * scale))
  const canvas = document.createElement('canvas')
  canvas.width = cw
  canvas.height = ch
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  const img = ctx.createImageData(cw, ch)
  const r = Math.min(radius, w / 2, h / 2)
  for (let py = 0; py < ch; py++) {
    for (let px = 0; px < cw; px++) {
      const x = (px + 0.5) / scale
      const y = (py + 0.5) / scale
      // signed distance to the rounded rect (negative inside)
      const qx = Math.abs(x - w / 2) - (w / 2 - r)
      const qy = Math.abs(y - h / 2) - (h / 2 - r)
      const ox = Math.max(qx, 0)
      const oy = Math.max(qy, 0)
      const dist = Math.hypot(ox, oy) + Math.min(Math.max(qx, qy), 0) - r
      const inside = -dist
      let dx = 0
      let dy = 0
      if (inside < bevel) {
        // gradient of the sdf = outward normal; the lens pulls inward
        let nx = 0
        let ny = 0
        if (qx > 0 && qy > 0) {
          const len = Math.hypot(qx, qy) || 1
          nx = (qx / len) * Math.sign(x - w / 2)
          ny = (qy / len) * Math.sign(y - h / 2)
        } else if (qx > qy) {
          nx = Math.sign(x - w / 2)
        } else {
          ny = Math.sign(y - h / 2)
        }
        const t = 1 - Math.max(inside, 0) / bevel
        const strength = t * t * (3 - 2 * t)
        dx = -nx * strength
        dy = -ny * strength
      }
      const i = (py * cw + px) * 4
      img.data[i] = Math.round(128 + dx * 127)
      img.data[i + 1] = Math.round(128 + dy * 127)
      img.data[i + 2] = 128
      img.data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  return canvas.toDataURL()
}

interface GlassProps {
  children?: ReactNode
  className?: string
  style?: CSSProperties
  /** corner radius in px at the current size; defaults to the CSS radius */
  radius?: number
  /** refraction strength in px */
  strength?: number
  tone?: 'clear' | 'frost'
  /** bend the backdrop at the bevel; only worth it over something visible */
  refract?: boolean
}

export function Glass({
  children,
  className,
  style,
  radius,
  strength = 38,
  tone = 'clear',
  refract = false,
}: GlassProps) {
  const ref = useRef<HTMLDivElement>(null)
  const filterId = `lg-${useId().replace(/:/g, '')}`
  const [map, setMap] = useState<{ href: string; w: number; h: number } | null>(
    null,
  )

  useEffect(() => {
    const el = ref.current
    if (!el || !refract || !supportsRefraction) return
    let frame = 0
    const build = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const { width, height } = el.getBoundingClientRect()
        if (width < 4 || height < 4) return
        const r =
          radius ?? (parseFloat(getComputedStyle(el).borderTopLeftRadius) || 24)
        const bevel = Math.min(
          Math.max(r * 0.9, 14),
          Math.min(width, height) / 2,
        )
        setMap({
          href: displacementMap(width, height, r, bevel),
          w: width,
          h: height,
        })
      })
    }
    build()
    const observer = new ResizeObserver(build)
    observer.observe(el)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [radius, refract])

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty(
      '--gx',
      `${((event.clientX - rect.left) / rect.width) * 100}%`,
    )
    el.style.setProperty(
      '--gy',
      `${((event.clientY - rect.top) / rect.height) * 100}%`,
    )
  }

  const refracting = refract && supportsRefraction && map
  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      className={cn('lg', tone === 'frost' && 'lg--frost', className)}
      style={{
        ...style,
        ...(refracting
          ? {
              backdropFilter: `url(#${filterId}) blur(1.5px) saturate(1.8) brightness(1.04)`,
              WebkitBackdropFilter: `url(#${filterId}) blur(1.5px) saturate(1.8)`,
            }
          : null),
      }}
    >
      {refracting ? (
        <svg className="lg__defs" aria-hidden width="0" height="0">
          <filter
            id={filterId}
            x="0"
            y="0"
            width={map.w}
            height={map.h}
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="soft" />
            <feImage
              href={map.href}
              x="0"
              y="0"
              width={map.w}
              height={map.h}
              preserveAspectRatio="none"
              result="lens"
            />
            <feDisplacementMap
              in="soft"
              in2="lens"
              scale={strength}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </svg>
      ) : null}
      <span className="lg__rim" aria-hidden />
      <span className="lg__sheen" aria-hidden />
      <div className="lg__body">{children}</div>
    </div>
  )
}
