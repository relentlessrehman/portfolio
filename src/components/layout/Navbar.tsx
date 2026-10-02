import { Link } from '@tanstack/react-router'
import { Menu, Search } from 'lucide-react'
import { content } from '#/content'
import { primaryNav } from '#/config/nav'
import { openCommandPalette } from '#/features/search/lib/palette-events'
import { MotionToggle } from './MotionToggle'
import { openMobileNav } from './nav-drawer-events'

/**
 * Minimal top bar (DESIGN.md §10). On the home film it stays hidden through the
 * intro and fades in at the end of scene 01 (html[data-nav]); over the paper
 * scene it switches to ink (html[data-tone="light"]).
 */
export function Navbar() {
  return (
    <header className="site-nav print:hidden">
      <nav aria-label="Primary" className="site-nav__inner">
        <Link
          to="/"
          className="nav-mark"
          aria-label={`${content.profile.name}, home`}
        >
          <span className="f-orb nav-mark__dot" aria-hidden />
          <span className="nav-label nav-mark__name">
            {content.profile.name}
          </span>
        </Link>

        <div className="liquid nav-pill flex items-center">
          <ul className="hidden items-center md:flex">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link to={item.href} className="nav-label nav-link">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={openCommandPalette}
            aria-label="Search (Ctrl+K)"
            className="nav-label nav-link inline-flex items-center gap-2"
          >
            <Search className="size-3.5" aria-hidden />
            <kbd className="hidden font-display md:inline">⌘K</kbd>
          </button>

          <MotionToggle className="nav-link hidden lg:inline-flex" />

          <button
            type="button"
            onClick={openMobileNav}
            aria-label="Open site menu"
            className="nav-link inline-flex md:hidden"
          >
            <Menu className="size-4" aria-hidden />
          </button>
        </div>
      </nav>
    </header>
  )
}
