import { useEffect, useRef } from 'react'
import { Link } from '@tanstack/react-router'
import { X } from 'lucide-react'
import { footerGroups } from '#/config/nav'
import { OPEN_MOBILE_NAV_EVENT } from './nav-drawer-events'

/**
 * Mobile-only "more" drawer — reachable from the Navbar's menu button.
 * Lists every page (via footerGroups) so mobile users aren't limited to
 * the 5 items in BottomNav or to scrolling down to the Footer.
 */
export function MobileNavDrawer() {
  const dialogRef = useRef<HTMLDialogElement>(null)

  function close() {
    dialogRef.current?.close()
  }

  useEffect(() => {
    function handleOpenEvent() {
      dialogRef.current?.showModal()
    }
    window.addEventListener(OPEN_MOBILE_NAV_EVENT, handleOpenEvent)
    return () => window.removeEventListener(OPEN_MOBILE_NAV_EVENT, handleOpenEvent)
  }, [])

  return (
    <dialog
      ref={dialogRef}
      onClose={close}
      onClick={(event) => {
        if (event.target === dialogRef.current) close()
      }}
      aria-label="Site menu"
      className="nav-drawer m-0 ml-auto h-dvh max-h-dvh w-[min(85vw,22rem)] max-w-none bg-transparent p-0 backdrop:bg-background/70"
    >
      <div className="glass glass-strong flex h-full flex-col overflow-y-auto rounded-l-3xl border-y-0 border-r-0 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between">
          <span className="font-display text-title-3 text-foreground">Menu</span>
          <button
            type="button"
            onClick={close}
            aria-label="Close menu"
            className="rounded-full p-2 text-muted-foreground transition-colors duration-(--duration-fast) hover:text-foreground"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <nav aria-label="All pages" className="mt-6 flex-1 space-y-7">
          <div>
            <Link
              to="/"
              onClick={close}
              className="block rounded-lg px-2 py-2.5 text-body text-foreground hover:bg-surface [&.active]:text-accent"
            >
              Home
            </Link>
            <Link
              to="/"
              hash="contact"
              onClick={close}
              className="block rounded-lg px-2 py-2.5 text-body text-foreground hover:bg-surface"
            >
              Contact
            </Link>
          </div>

          {footerGroups.map((group) =>
            group.items.length > 0 ? (
              <div key={group.title}>
                <h2 className="mb-2 px-2 font-mono text-mono-sm tracking-widest text-subtle-foreground uppercase">
                  {group.title}
                </h2>
                <ul>
                  {group.items.map((item) => (
                    <li key={item.href}>
                      {item.href.startsWith('/') && !item.href.includes('.') ? (
                        <Link
                          to={item.href}
                          onClick={close}
                          className="block rounded-lg px-2 py-2.5 text-body text-muted-foreground hover:bg-surface hover:text-foreground [&.active]:text-accent"
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <a
                          href={item.href}
                          onClick={close}
                          className="block rounded-lg px-2 py-2.5 text-body text-muted-foreground hover:bg-surface hover:text-foreground"
                        >
                          {item.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null,
          )}
        </nav>
      </div>
    </dialog>
  )
}
