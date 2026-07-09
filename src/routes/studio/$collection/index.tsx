import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { collectionRegistry, isCollectionKey } from '#/content/studio/registry'
import { readCollection, writeCollection } from '#/server/studio'
import { collectionForms } from '#/features/studio/components/forms'
import { Section } from '#/components/shared/Section'
import { buttonVariants } from '#/components/ui/button'
import { Button } from '#/components/ui/button'
import { BackLink, SaveBar, StudioGate, StudioHeader } from '#/features/studio/components/StudioChrome'
import { cn } from '#/lib/utils'
import type { CollectionEntry, CollectionKey } from '#/content/studio/registry'

export const Route = createFileRoute('/studio/$collection/')({
  loader: async ({ params }) => {
    if (!isCollectionKey(params.collection)) throw notFound()
    const data = await readCollection({ data: params.collection })
    return { collection: params.collection, data }
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${collectionRegistry[loaderData.collection].label} — Studio`
          : 'Studio',
      },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: CollectionIndex,
})

function CollectionIndex() {
  const { collection, data } = Route.useLoaderData()
  const entry = collectionRegistry[collection]

  return (
    <StudioGate>
      <Section>
        <StudioHeader
          title={entry.label}
          description={entry.description}
          back={<BackLink to="/studio">Back to Studio</BackLink>}
        />
        {entry.kind === 'singleton' ? (
          <SingletonEditor collection={collection} initial={data} />
        ) : (
          <ListEditor collection={collection} initial={data as Array<any>} />
        )}
      </Section>
    </StudioGate>
  )
}

function SingletonEditor({ collection, initial }: { collection: CollectionKey; initial: unknown }) {
  const [value, setValue] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [errors, setErrors] = useState<Array<string>>()
  const write = useServerFn(writeCollection)
  const Form = collectionForms[collection]

  async function handleSave() {
    setSaving(true)
    setErrors(undefined)
    const result = await write({ data: { key: collection, value } })
    setSaving(false)
    if (result.ok) {
      setStatus('saved')
      window.location.reload()
    } else {
      setStatus('error')
      setErrors(result.issues)
    }
  }

  return (
    <div className="mt-8">
      <Form value={value} onChange={setValue} />
      <SaveBar onSave={handleSave} saving={saving} status={status} errors={errors} />
    </div>
  )
}

function ListEditor({ collection, initial }: { collection: CollectionKey; initial: Array<any> }) {
  const entry: CollectionEntry = collectionRegistry[collection]
  const write = useServerFn(writeCollection)
  const [items, setItems] = useState(initial)
  const [deleting, setDeleting] = useState<number | null>(null)
  const singular = entry.label.replace(/ies$/, 'y').replace(/s$/, '')

  async function handleDelete(index: number) {
    if (!window.confirm('Delete this entry? This cannot be undone.')) return
    setDeleting(index)
    const next = items.filter((_, i) => i !== index)
    const result = await write({ data: { key: collection, value: next } })
    if (result.ok) setItems(next)
    setDeleting(null)
  }

  return (
    <div className="mt-8 grid gap-4">
      <Link
        to="/studio/$collection/$itemIndex"
        params={{ collection, itemIndex: 'new' }}
        className={cn(buttonVariants({ size: 'sm' }), 'w-fit')}
      >
        + New {singular}
      </Link>
      {items.length === 0 ? (
        <p className="text-body text-muted-foreground">Nothing here yet — add the first one.</p>
      ) : (
        <ul className="grid gap-3">
          {items.map((item, index) => (
            <li
              key={index}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4"
            >
              <Link
                to="/studio/$collection/$itemIndex"
                params={{ collection, itemIndex: String(index) }}
                className="grid gap-0.5"
              >
                <span className="text-body font-medium text-foreground">
                  {entry.itemLabel?.(item) || `Entry ${index + 1}`}
                </span>
                {entry.itemSubtitle?.(item) ? (
                  <span className="text-small text-muted-foreground">
                    {entry.itemSubtitle(item)}
                  </span>
                ) : null}
              </Link>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(index)}
                disabled={deleting === index}
              >
                Delete
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
