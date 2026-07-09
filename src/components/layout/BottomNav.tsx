import { Link, useRouterState } from '@tanstack/react-router'
import { Code2, FolderGit2, Home, Mail, User } from 'lucide-react'
import { mobileNav } from '#/config/nav'
import { cn } from '#/lib/utils'
import type { MobileNavItem } from '#/config/nav'

const icons: Record<MobileNavItem['icon'], typeof Home> = {
  home: Home,
  projects: FolderGit2,
  skills: Code2,
  user: User,
  contact: Mail,
}

/**
 * Mobile-only bottom navigation — primary destinations in thumb reach,
 * replacing the hamburger menu entirely. Hidden ≥md and in print.
 */
export function BottomNav() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  return (
    <nav
      aria-label="Primary mobile"
      className="glass fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 rounded-3xl md:hidden print:hidden"
    >
      <ul className="grid" style={{ gridTemplateColumns: `repeat(${mobileNav.length}, 1fr)` }}>
        {mobileNav.map((item) => {
          const Icon = icons[item.icon]
          const [path, hash] = item.href.split('#')
          const isActive = item.exact
            ? pathname === path && !hash
            : pathname.startsWith(path) && path !== '/'
          return (
            <li key={item.href}>
              <Link
                to={path || '/'}
                hash={hash}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex min-h-14 flex-col items-center justify-center gap-1 rounded-3xl transition-[color,transform] duration-(--duration-fast) motion-safe:hover:-translate-y-0.5',
                  isActive ? 'text-accent' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="size-5" aria-hidden />
                <span className="font-mono text-[0.6875rem] tracking-wide">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
