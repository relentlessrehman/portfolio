import { Link } from '@tanstack/react-router'
import { content, featuredSocials } from '#/content'
import { footerGroups } from '#/config/nav'
import { MotionToggle } from './MotionToggle'

/** End credits (STORYBOARD 14): every page, the people-facing links, the colophon */
export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="credits print:hidden">
      <div className="credits__inner">
        <div className="credits__lead">
          <p className="credits__name">{content.profile.name}</p>
          <p className="nav-label text-subtle-foreground">
            Software engineer · Product builder · Founder
          </p>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            {featuredSocials.map((link) => (
              <li key={link.platform}>
                <a
                  href={link.url}
                  target={link.platform === 'email' ? undefined : '_blank'}
                  rel="noreferrer"
                  className="nav-label text-muted-foreground hover:text-foreground"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Footer" className="credits__nav">
          {footerGroups.map((group) =>
            group.items.length > 0 ? (
              <div key={group.title}>
                <h2 className="nav-label mb-4 text-subtle-foreground">
                  {group.title}
                </h2>
                <ul className="space-y-2.5">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      {item.href.startsWith('/') && !item.href.includes('.') ? (
                        <Link
                          to={item.href}
                          className="text-small text-muted-foreground hover:text-foreground"
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <a
                          href={item.href}
                          className="text-small text-muted-foreground hover:text-foreground"
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

      <div className="credits__base">
        <p className="text-small text-subtle-foreground">
          © {year} {content.profile.name}. Built with TanStack Start, three.js
          and GSAP. Set in Geist.
        </p>
        <MotionToggle className="text-subtle-foreground hover:text-foreground" />
      </div>
    </footer>
  )
}
