import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { Fragment } from 'react'
import { JsonLd } from './JsonLd'
import { breadcrumbJsonLd } from '#/lib/seo/jsonld'

export interface Crumb {
  name: string
  /** Omit for the current page (rendered as text, not a link) */
  path?: string
}

export function Breadcrumbs({ items }: { items: Array<Crumb> }) {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(
          items.map((item) => ({ name: item.name, path: item.path ?? '' })),
        )}
      />
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 text-small text-subtle-foreground">
          {items.map((item, index) => (
            <Fragment key={item.name}>
              {index > 0 ? <ChevronRight className="size-3.5" aria-hidden /> : null}
              <li>
                {item.path ? (
                  <Link to={item.path} className="hover:text-foreground">
                    {item.name}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-muted-foreground">
                    {item.name}
                  </span>
                )}
              </li>
            </Fragment>
          ))}
        </ol>
      </nav>
    </>
  )
}
