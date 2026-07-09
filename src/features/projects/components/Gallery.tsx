import { useCallback, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '#/lib/utils'
import type { GalleryImage } from '#/content/schemas/project'

const SWIPE_THRESHOLD_PX = 48

/**
 * Image grid with a native <dialog> lightbox: arrow-key navigation,
 * touch swipe, captions, and a thumbnail strip. No dependencies —
 * the platform dialog handles focus trapping and Esc.
 */
export function Gallery({ images, title }: { images: Array<GalleryImage>; title: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const touchStartX = useRef<number | null>(null)
  const [index, setIndex] = useState<number | null>(null)

  const step = useCallback(
    (delta: number) => {
      setIndex((current) =>
        current === null ? current : (current + delta + images.length) % images.length,
      )
    },
    [images.length],
  )

  if (images.length === 0) return null

  const active = index === null ? null : images[index]

  function open(imageIndex: number) {
    setIndex(imageIndex)
    dialogRef.current?.showModal()
  }

  function close() {
    dialogRef.current?.close()
    setIndex(null)
  }

  return (
    <section aria-label={`${title} gallery`}>
      <div className="grid gap-4 sm:grid-cols-2">
        {images.map((image, imageIndex) => (
          <button
            key={image.src}
            type="button"
            onClick={() => open(imageIndex)}
            className="group overflow-hidden rounded-md border border-border"
            aria-label={`Enlarge: ${image.caption ?? image.alt}`}
          >
            <img
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              loading="lazy"
              className="h-auto w-full transition-transform duration-(--duration-slow) group-hover:scale-[1.02] motion-reduce:group-hover:scale-100"
            />
          </button>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        onClose={close}
        onClick={(event) => {
          if (event.target === dialogRef.current) close()
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') step(1)
          if (event.key === 'ArrowLeft') step(-1)
        }}
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0]?.clientX ?? null
        }}
        onTouchEnd={(event) => {
          const startX = touchStartX.current
          touchStartX.current = null
          const endX = event.changedTouches[0]?.clientX
          if (startX === null || endX === undefined) return
          const delta = endX - startX
          if (Math.abs(delta) >= SWIPE_THRESHOLD_PX) step(delta < 0 ? 1 : -1)
        }}
        className="m-auto max-h-[94dvh] w-[min(92vw,64rem)] rounded-md border border-border bg-background p-3 backdrop:bg-background/85"
      >
        {active ? (
          <div className="flex flex-col gap-3">
            <div className="relative">
              <img
                src={active.src}
                alt={active.alt}
                className="mx-auto max-h-[70dvh] w-auto rounded-sm"
              />
              {images.length > 1 ? (
                <>
                  <LightboxArrow direction="previous" onClick={() => step(-1)} />
                  <LightboxArrow direction="next" onClick={() => step(1)} />
                </>
              ) : null}
            </div>

            <div className="flex items-center justify-between gap-4">
              <p className="text-small text-muted-foreground">
                {active.caption ?? active.alt}
                {images.length > 1 ? (
                  <span className="ml-3 font-mono text-mono-sm text-subtle-foreground">
                    {(index ?? 0) + 1} / {images.length}
                  </span>
                ) : null}
              </p>
              <button
                type="button"
                onClick={close}
                className="flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
              >
                <X aria-hidden />
                <span className="sr-only">Close</span>
              </button>
            </div>

            {images.length > 1 ? (
              <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Gallery thumbnails">
                {images.map((image, imageIndex) => (
                  <button
                    key={image.src}
                    type="button"
                    role="tab"
                    aria-selected={imageIndex === index}
                    aria-label={`Image ${imageIndex + 1}: ${image.alt}`}
                    onClick={() => setIndex(imageIndex)}
                    className={cn(
                      'h-14 w-20 shrink-0 overflow-hidden rounded-sm border',
                      imageIndex === index
                        ? 'border-accent'
                        : 'border-border opacity-60 hover:opacity-100',
                    )}
                  >
                    <img src={image.src} alt="" className="size-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </dialog>
    </section>
  )
}

function LightboxArrow({
  direction,
  onClick,
}: {
  direction: 'previous' | 'next'
  onClick: () => void
}) {
  const Icon = direction === 'previous' ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'absolute top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/80 text-muted-foreground hover:text-foreground',
        direction === 'previous' ? 'left-2' : 'right-2',
      )}
    >
      <Icon aria-hidden />
      <span className="sr-only">{direction === 'previous' ? 'Previous image' : 'Next image'}</span>
    </button>
  )
}
