import { Link } from '@tanstack/react-router'
import { content, featuredSocials } from '#/content'
import { footerGroups } from '#/config/nav'
import { Container } from '#/components/shared/Container'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-section border-t border-border print:hidden">
      <Container className="grid gap-10 py-12 md:grid-cols-[1fr_auto]">
        <div className="max-w-sm">
          <p className="font-display text-title-3 text-foreground">{content.profile.name}</p>
          <p className="mt-2 text-small text-muted-foreground">{content.profile.shortBio}</p>
          <ul className="mt-5 flex gap-4">
            {featuredSocials.map((link) => (
              <li key={link.platform}>
                <a
                  href={link.url}
                  target={link.platform === 'email' ? undefined : '_blank'}
                  rel="noreferrer"
                  className="text-small text-muted-foreground hover:text-foreground"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:gap-14">
          {footerGroups.map((group) =>
            group.items.length > 0 ? (
              <div key={group.title}>
                <h2 className="mb-3 font-mono text-mono-sm tracking-widest text-subtle-foreground uppercase">
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
      </Container>

      <Container className="border-t border-border py-6">
        <p className="text-small text-subtle-foreground">
          © {year} {content.profile.name}. {content.profile.motto}
        </p>
      </Container>
    </footer>
  )
}
