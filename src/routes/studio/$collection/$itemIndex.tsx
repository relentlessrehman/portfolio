import { createFileRoute, notFound } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { collectionRegistry, isCollectionKey } from '#/content/studio/registry'
import { readCollection, writeCollection } from '#/server/studio'
import { collectionForms } from '#/features/studio/components/forms'
import { Section } from '#/components/shared/Section'
import { BackLink, SaveBar, StudioGate, StudioHeader } from '#/features/studio/components/StudioChrome'

export const Route = createFileRoute('/studio/$collection/$itemIndex')({
  loader: async ({ params }) => {
    if (!isCollectionKey(params.collection)) throw notFound()
    const entry = collectionRegistry[params.collection]
    if (entry.kind !== 'list') throw notFound()

    if (params.itemIndex === 'new') {
      return { collection: params.collection, index: null as number | null, item: entry.blank?.() ?? {} }
    }
    const index = Number(params.itemIndex)
    if (!Number.isInteger(index) || index < 0) throw notFound()
    const list = (await readCollection({ data: params.collection })) as Array<unknown>
    const item = list[index]
    if (item === undefined) throw notFound()
    return { collection: params.collection, index, item }
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.index === null ? 'New' : 'Edit'} ${collectionRegistry[loaderData.collection].label} — Studio`
          : 'Studio',
      },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: ItemEditor,
})

function ItemEditor() {
  const { collection, index, item } = Route.useLoaderData()
  const entry = collectionRegistry[collection]
  const Form = collectionForms[collection]
  const [value, setValue] = useState(item)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [errors, setErrors] = useState<Array<string>>()
  const write = useServerFn(writeCollection)
  const singular = entry.label.replace(/ies$/, 'y').replace(/s$/, '')

  async function handleSave() {
    setSaving(true)
    setErrors(undefined)
    const current = (await readCollection({ data: collection })) as Array<unknown>
    const next =
      index === null
        ? [...current, value]
        : current.map((existing, i) => (i === index ? value : existing))
    const result = await write({ data: { key: collection, value: next } })
    setSaving(false)
    if (result.ok) {
      setStatus('saved')
      window.location.href = `/studio/${collection}`
    } else {
      setStatus('error')
      setErrors(result.issues)
    }
  }

  async function handleDelete() {
    if (index === null) return
    if (!window.confirm('Delete this entry? This cannot be undone.')) return
    const current = (await readCollection({ data: collection })) as Array<unknown>
    const next = current.filter((_, i) => i !== index)
    await write({ data: { key: collection, value: next } })
    window.location.href = `/studio/${collection}`
  }

  return (
    <StudioGate>
      <Section>
        <StudioHeader
          title={index === null ? `New ${singular}` : `Edit ${singular}`}
          back={
            <BackLink to="/studio/$collection" params={{ collection }}>
              Back to {entry.label}
            </BackLink>
          }
        />
        <div className="mt-8">
          <Form value={value} onChange={setValue} />
          <SaveBar
            onSave={handleSave}
            onDelete={index !== null ? handleDelete : undefined}
            saving={saving}
            status={status}
            errors={errors}
          />
        </div>
      </Section>
    </StudioGate>
  )
}
