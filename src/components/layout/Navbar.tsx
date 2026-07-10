import { Link } from '@tanstack/react-router'
import { ChevronDown, Menu, Search } from 'lucide-react'
import { content } from '#/content'
import { exploreNav, primaryNav } from '#/config/nav'
import { openCommandPalette } from '#/features/search/lib/palette-events'
import { openMobileNav } from './nav-drawer-events'

/**
 * Top bar: brand + desktop links. Mobile primary navigation lives in
 * BottomNav; the menu button here (mobile-only) opens MobileNavDrawer
 * for everything else on the site.
 */
export function Navbar() {
  return (
    <header className="sticky top-4 z-40 mx-auto w-[calc(100%-2rem)] max-w-[1200px] print:hidden">
      <nav
        aria-label="Primary"
        className="glass flex h-16 items-center justify-between rounded-full px-4 sm:px-6"
      >
        <Link to="/" className="font-display text-title-3 font-semibold text-foreground">
          {content.profile.name}
        </Link>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={openCommandPalette}
            aria-label="Search (Ctrl+K)"
            className="flex items-center gap-2 rounded-full p-2.5 text-muted-foreground transition-colors duration-(--duration-fast) hover:text-foreground md:border md:border-border md:px-3 md:py-2 md:hover:border-border-strong"
          >
            <Search className="size-4" aria-hidden />
            <kbd className="hidden font-mono text-mono-sm md:inline">Ctrl+K</kbd>
          </button>

          <button
            type="button"
            onClick={openMobileNav}
            aria-label="Open site menu"
            className="flex items-center gap-2 rounded-full p-2.5 text-muted-foreground transition-colors duration-(--duration-fast) hover:text-foreground md:hidden"
          >
            <Menu className="size-4" aria-hidden />
          </button>

          {primaryNav.length > 0 ? (
            <ul className="hidden items-center gap-1 md:flex">
              {primaryNav.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    activeOptions={item.href === '/' ? { exact: true } : undefined}
                    className="rounded-full px-3.5 py-2.5 text-small text-muted-foreground transition-colors duration-(--duration-fast) hover:text-foreground [&.active]:text-accent"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              {exploreNav.length > 0 ? (
                <li className="group relative">
                  <button
                    type="button"
                    className="flex items-center gap-1 rounded-full px-3.5 py-2.5 text-small text-muted-foreground transition-colors duration-(--duration-fast) hover:text-foreground group-focus-within:text-foreground"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    Explore
                    <ChevronDown className="size-3 transition-transform group-focus-within:rotate-180 group-hover:rotate-180" aria-hidden />
                  </button>
                  <div className="invisible absolute top-full right-0 z-50 min-w-40 translate-y-2 opacity-0 shadow-lg ring-1 ring-border transition-all duration-(--duration-fast) group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    <ul className="glass glass-strong rounded-2xl p-1.5">
                      {exploreNav.map((item) => (
                        <li key={item.href}>
                          <Link
                            to={item.href}
                            className="block rounded-xl px-3 py-2 text-small text-muted-foreground hover:bg-surface hover:text-foreground [&.active]:bg-accent-muted [&.active]:text-foreground"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ) : null}
              <li>
                <Link
                  to="/"
                  hash="contact"
                  className="ml-2 rounded-full border border-border px-3.5 py-2 text-small text-muted-foreground transition-colors duration-(--duration-fast) hover:border-border-strong hover:text-foreground"
                >
                  Contact
                </Link>
              </li>
            </ul>
          ) : null}
        </div>
      </nav>
    </header>
  )
}
