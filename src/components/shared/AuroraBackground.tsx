import { useEffect, useRef } from 'react'

/**
 * Fixed, full-viewport animated environment behind all content: aurora
 * blobs (pure CSS keyframes — no JS animation loop), grain, vignette, and
 * a very subtle cursor-driven light that never chases the pointer.
 * Mounted once in the root layout.
 */
export function AuroraBackground() {
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!fine.matches || reduced.matches) return

    let frame = 0
    const node = glowRef.current
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        if (!node) return
        const xPct = (event.clientX / window.innerWidth) * 100
        const yPct = (event.clientY / window.innerHeight) * 100
        node.style.setProperty('--pointer-x', `${xPct}%`)
        node.style.setProperty('--pointer-y', `${yPct}%`)
      })
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div className="aurora-layer grain-overlay" aria-hidden>
      <div className="aurora-blob aurora-blob-1" />
      <div className="aurora-blob aurora-blob-2" />
      <div className="aurora-blob aurora-blob-3" />
      <div className="aurora-blob aurora-blob-4" />
      <div ref={glowRef} className="aurora-pointer-glow" />
      <div className="aurora-vignette" />
    </div>
  )
}
