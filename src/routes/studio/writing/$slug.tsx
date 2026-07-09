import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { readPost, savePost } from '#/server/studio'
import { Section } from '#/components/shared/Section'
import {
  CheckboxField,
  ParagraphsField,
  TextAreaField,
  TextField,
} from '#/features/studio/components/fields'
import { BackLink, SaveBar, StudioGate, StudioHeader } from '#/features/studio/components/StudioChrome'

export const Route = createFileRoute('/studio/writing/$slug')({
  loader: ({ params }) => readPost({ data: params.slug }),
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `Edit “${loaderData.frontmatter.title}” — Studio` : 'Studio' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: PostEditor,
})

function PostEditor() {
  const { slug } = Route.useParams()
  const initial = Route.useLoaderData()
  const [frontmatter, setFrontmatter] = useState(initial.frontmatter)
  const [body, setBody] = useState(initial.body)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [errors, setErrors] = useState<Array<string>>()
  const save = useServerFn(savePost)

  async function handleSave() {
    setSaving(true)
    setErrors(undefined)
    const result = await save({ data: { slug, frontmatter, body } })
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
    <StudioGate>
      <Section>
        <StudioHeader
          title={frontmatter.title || slug}
          back={<BackLink to="/studio/writing">Back to Writing</BackLink>}
        />
        <div className="mt-8 grid gap-6">
          <TextField
            label="Title"
            value={frontmatter.title}
            onChange={(v) => setFrontmatter({ ...frontmatter, title: v })}
            required
          />
          <TextAreaField
            label="Description"
            value={frontmatter.description}
            onChange={(v) => setFrontmatter({ ...frontmatter, description: v })}
            hint={`${frontmatter.description.length}/300 — cards, meta tags, RSS`}
            rows={2}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Published at"
              value={frontmatter.publishedAt}
              onChange={(v) => setFrontmatter({ ...frontmatter, publishedAt: v })}
              hint="YYYY-MM-DD"
              required
            />
            <TextField
              label="Updated at (optional)"
              value={frontmatter.updatedAt ?? ''}
              onChange={(v) => setFrontmatter({ ...frontmatter, updatedAt: v || undefined })}
              hint="YYYY-MM-DD"
            />
          </div>
          <ParagraphsField
            label="Tags"
            value={frontmatter.tags}
            onChange={(v) => setFrontmatter({ ...frontmatter, tags: v })}
          />
          <CheckboxField
            label="Draft"
            checked={frontmatter.draft}
            onChange={(checked) => setFrontmatter({ ...frontmatter, draft: checked })}
            hint="Drafts are excluded from lists, feeds, and search"
          />
          <TextAreaField
            label="Body (Markdown / MDX)"
            value={body}
            onChange={setBody}
            hint="GFM tables and fenced code blocks work; code is syntax-highlighted at build time"
            rows={20}
          />
        </div>
        <SaveBar onSave={handleSave} saving={saving} status={status} errors={errors} />
      </Section>
    </StudioGate>
  )
}
