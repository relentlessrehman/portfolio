import { useState } from 'react'
import {
  CheckboxField,
  FieldGroup,
  FieldRow,
  JsonField,
  NoteListField,
  NumberField,
  ParagraphsField,
  SelectField,
  TextAreaField,
  TextField,
} from './fields'
import { availabilityStatusSchema } from '#/content/schemas/profile'
import { socialPlatformSchema } from '#/content/schemas/social'
import { skillCategorySchema } from '#/content/schemas/skill'
import { experienceTypeSchema } from '#/content/schemas/experience'
import { projectStatusSchema, projectDifficultySchema } from '#/content/schemas/project'
import { changelogTagSchema, readingStatusSchema } from '#/content/schemas/misc'
import type { Profile } from '#/content/schemas/profile'
import type { SocialLink } from '#/content/schemas/social'
import type { SiteSeo } from '#/content/schemas/seo'
import type { Education } from '#/content/schemas/education'
import type { Skill } from '#/content/schemas/skill'
import type { Experience } from '#/content/schemas/experience'
import type { Achievement } from '#/content/schemas/achievement'
import type { ProjectInput } from '#/content/schemas/project'
import type {
  Certification,
  UsesCategory,
  Now,
  ChangelogEntry,
  Milestone,
  OpenSourceContribution,
  ReadingItem,
  SpeakingEngagement,
  Resume,
} from '#/content/schemas/misc'
import type { CollectionKey } from '#/content/studio/registry'
import type { ComponentType } from 'react'

function toOptions(values: ReadonlyArray<string>, empty?: string) {
  const options = values.map((value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' '),
  }))
  return empty ? [{ value: '', label: empty }, ...options] : options
}

/* ── Profile ──────────────────────────────────────────────────────────── */

export function ProfileForm({
  value,
  onChange,
}: {
  value: Profile
  onChange: (value: Profile) => void
}) {
  const set = <K extends keyof Profile>(key: K, val: Profile[K]) =>
    onChange({ ...value, [key]: val })
  return (
    <div className="grid gap-6">
      <FieldRow>
        <TextField label="Name" value={value.name} onChange={(v) => set('name', v)} required />
        <TextField
          label="Location"
          value={value.location}
          onChange={(v) => set('location', v)}
          required
        />
      </FieldRow>
      <TextField
        label="Role"
        value={value.role}
        onChange={(v) => set('role', v)}
        hint="Professional identity line — used in meta titles and JSON-LD"
        required
      />
      <TextField
        label="Headline"
        value={value.headline}
        onChange={(v) => set('headline', v)}
        hint="Hero statement — one sentence about what you do, not a job title"
        required
      />
      <TextAreaField
        label="Short bio"
        value={value.shortBio}
        onChange={(v) => set('shortBio', v)}
        hint={`${value.shortBio.length}/300 — cards and meta descriptions`}
        rows={3}
      />
      <ParagraphsField
        label="Rotating hero subtitles"
        value={value.subtitles}
        onChange={(v) => set('subtitles', v)}
        hint="One per line — the first renders without JS, so it must stand alone"
      />
      <ParagraphsField
        label="About"
        value={value.about}
        onChange={(v) => set('about', v)}
        hint="One paragraph per line"
        rows={6}
      />
      <FieldRow>
        <TextField label="Mission" value={value.mission} onChange={(v) => set('mission', v)} />
        <TextField label="Motto" value={value.motto} onChange={(v) => set('motto', v)} />
      </FieldRow>
      <ParagraphsField label="Values" value={value.values} onChange={(v) => set('values', v)} />
      <ParagraphsField
        label="Current focus"
        value={value.currentFocus}
        onChange={(v) => set('currentFocus', v)}
        hint="Feeds the Currently Building card and /now"
      />
      <ParagraphsField
        label="Interests"
        value={value.interests}
        onChange={(v) => set('interests', v)}
      />
      <NoteListField
        label="Spoken languages"
        value={value.spokenLanguages}
        onChange={(v) => set('spokenLanguages', v)}
        hint="One per line: Language | note — e.g. Italian | learning"
      />
      <FieldRow>
        <TextField
          label="Hometown (optional)"
          value={value.hometown ?? ''}
          onChange={(v) => set('hometown', v || undefined)}
        />
        <TextField
          label="Email"
          type="email"
          value={value.email}
          onChange={(v) => set('email', v)}
          required
        />
      </FieldRow>
      <TextField
        label="Phone (optional)"
        value={value.phone ?? ''}
        onChange={(v) => set('phone', v || undefined)}
      />
      <FieldGroup title="Availability">
        <FieldRow>
          <SelectField
            label="Status"
            value={value.availability.status}
            onChange={(v) =>
              set('availability', {
                ...value.availability,
                status: v as Profile['availability']['status'],
              })
            }
            options={toOptions(availabilityStatusSchema.options)}
          />
          <TextField
            label="Pill label"
            value={value.availability.label}
            onChange={(v) => set('availability', { ...value.availability, label: v })}
          />
        </FieldRow>
        <ParagraphsField
          label="Open to"
          value={value.availability.openTo}
          onChange={(v) => set('availability', { ...value.availability, openTo: v })}
        />
      </FieldGroup>
      <NumberField
        label="Coding since (year)"
        value={value.codingSince}
        onChange={(v) => set('codingSince', v ?? value.codingSince)}
      />
      <FieldGroup title="Portrait (optional — leave image path blank to hide)">
        <FieldRow>
          <TextField
            label="Image path"
            value={value.portrait?.src ?? ''}
            onChange={(v) =>
              set(
                'portrait',
                v
                  ? { ...value.portrait, src: v, alt: value.portrait?.alt || value.name }
                  : undefined,
              )
            }
            hint="e.g. /images/portrait.jpg"
          />
          <TextField
            label="Alt text"
            value={value.portrait?.alt ?? ''}
            onChange={(v) => value.portrait && set('portrait', { ...value.portrait, alt: v })}
          />
        </FieldRow>
      </FieldGroup>
    </div>
  )
}

/* ── Socials ──────────────────────────────────────────────────────────── */

export function SocialForm({
  value,
  onChange,
}: {
  value: SocialLink
  onChange: (value: SocialLink) => void
}) {
  return (
    <div className="grid gap-6">
      <FieldRow>
        <SelectField
          label="Platform"
          value={value.platform}
          onChange={(v) => onChange({ ...value, platform: v as SocialLink['platform'] })}
          options={toOptions(socialPlatformSchema.options)}
        />
        <TextField
          label="Label"
          value={value.label}
          onChange={(v) => onChange({ ...value, label: v })}
          required
        />
      </FieldRow>
      <TextField
        label="URL"
        value={value.url}
        onChange={(v) => onChange({ ...value, url: v })}
        required
      />
      <TextField
        label="Handle (optional)"
        value={value.handle ?? ''}
        onChange={(v) => onChange({ ...value, handle: v || undefined })}
      />
      <CheckboxField
        label="Featured"
        checked={value.featured}
        onChange={(checked) => onChange({ ...value, featured: checked })}
        hint="Featured links show on the hero/footer; others only on Contact"
      />
    </div>
  )
}

/* ── SEO ──────────────────────────────────────────────────────────────── */

export function SeoForm({ value, onChange }: { value: SiteSeo; onChange: (value: SiteSeo) => void }) {
  return (
    <div className="grid gap-6">
      <TextField
        label="Production URL"
        value={value.url}
        onChange={(v) => onChange({ ...value, url: v })}
        hint="Canonical origin, no trailing slash"
        required
      />
      <FieldRow>
        <TextField
          label="Site name"
          value={value.siteName}
          onChange={(v) => onChange({ ...value, siteName: v })}
          required
        />
        <TextField
          label="Title template"
          value={value.titleTemplate}
          onChange={(v) => onChange({ ...value, titleTemplate: v })}
          hint="Must include %s"
          required
        />
      </FieldRow>
      <TextField
        label="Default title"
        value={value.defaultTitle}
        onChange={(v) => onChange({ ...value, defaultTitle: v })}
        required
      />
      <TextAreaField
        label="Default description"
        value={value.defaultDescription}
        onChange={(v) => onChange({ ...value, defaultDescription: v })}
        hint={`${value.defaultDescription.length}/200`}
        rows={3}
      />
      <FieldRow>
        <TextField
          label="Default OG image path"
          value={value.defaultOgImage}
          onChange={(v) => onChange({ ...value, defaultOgImage: v })}
          hint="Path under /public"
        />
        <TextField
          label="Twitter handle (optional)"
          value={value.twitterHandle ?? ''}
          onChange={(v) => onChange({ ...value, twitterHandle: v || undefined })}
        />
      </FieldRow>
      <TextField
        label="Locale"
        value={value.locale}
        onChange={(v) => onChange({ ...value, locale: v })}
      />
    </div>
  )
}

/* ── Education ────────────────────────────────────────────────────────── */

export function EducationForm({
  value,
  onChange,
}: {
  value: Education
  onChange: (value: Education) => void
}) {
  return (
    <div className="grid gap-6">
      <FieldRow>
        <TextField
          label="ID"
          value={value.id}
          onChange={(v) => onChange({ ...value, id: v })}
          hint="Unique kebab-case identifier"
          required
        />
        <TextField
          label="Degree"
          value={value.degree}
          onChange={(v) => onChange({ ...value, degree: v })}
          required
        />
      </FieldRow>
      <FieldRow>
        <TextField
          label="Institution (optional)"
          value={value.institution ?? ''}
          onChange={(v) => onChange({ ...value, institution: v || undefined })}
        />
        <TextField
          label="School / faculty (optional)"
          value={value.school ?? ''}
          onChange={(v) => onChange({ ...value, school: v || undefined })}
        />
      </FieldRow>
      <TextField
        label="Location (optional)"
        value={value.location ?? ''}
        onChange={(v) => onChange({ ...value, location: v || undefined })}
      />
      <FieldGroup title="Period">
        <FieldRow>
          <TextField
            label="Start (optional)"
            value={value.period.start ?? ''}
            onChange={(v) =>
              onChange({ ...value, period: { ...value.period, start: v || undefined } })
            }
            hint="YYYY or YYYY-MM"
          />
          <NumberField
            label="End year"
            value={value.period.end}
            onChange={(v) =>
              onChange({ ...value, period: { ...value.period, end: v ?? value.period.end } })
            }
          />
        </FieldRow>
        <CheckboxField
          label="End year is expected (not yet graduated)"
          checked={value.period.expected}
          onChange={(checked) =>
            onChange({ ...value, period: { ...value.period, expected: checked } })
          }
        />
      </FieldGroup>
      <TextAreaField
        label="Summary (optional)"
        value={value.summary ?? ''}
        onChange={(v) => onChange({ ...value, summary: v || undefined })}
        rows={3}
      />
      <ParagraphsField
        label="Highlights"
        value={value.highlights}
        onChange={(v) => onChange({ ...value, highlights: v })}
      />
    </div>
  )
}

/* ── Skills (singleton: categories + learning topics) ────────────────── */

interface SkillsValue {
  skills: Array<Skill>
  learningTopics: Array<string>
}

const SKILL_CATEGORY_LABELS: Record<string, string> = {
  language: 'Languages',
  frontend: 'Frontend',
  backend: 'Backend',
  database: 'Database',
  tools: 'Tools',
  concepts: 'Software Engineering Concepts',
}

export function SkillsForm({
  value,
  onChange,
}: {
  value: SkillsValue
  onChange: (value: SkillsValue) => void
}) {
  return (
    <div className="grid gap-6">
      {skillCategorySchema.options.map((category) => {
        const names = value.skills.filter((skill) => skill.category === category).map((s) => s.name)
        return (
          <ParagraphsField
            key={category}
            label={SKILL_CATEGORY_LABELS[category]}
            value={names}
            onChange={(updatedNames) => {
              const rest = value.skills.filter((skill) => skill.category !== category)
              const updated = updatedNames.map((name) => ({ name, category }))
              onChange({ ...value, skills: [...rest, ...updated] })
            }}
            hint="One skill per line — spelling must match project techStack entries"
          />
        )
      })}
      <ParagraphsField
        label="Currently learning"
        value={value.learningTopics}
        onChange={(v) => onChange({ ...value, learningTopics: v })}
        hint="Rendered as honest 'currently learning', never claimed as a skill"
      />
    </div>
  )
}

/* ── Experience ───────────────────────────────────────────────────────── */

export function ExperienceForm({
  value,
  onChange,
}: {
  value: Experience
  onChange: (value: Experience) => void
}) {
  return (
    <div className="grid gap-6">
      <FieldRow>
        <TextField
          label="ID"
          value={value.id}
          onChange={(v) => onChange({ ...value, id: v })}
          required
        />
        <SelectField
          label="Type"
          value={value.type}
          onChange={(v) => onChange({ ...value, type: v as Experience['type'] })}
          options={toOptions(experienceTypeSchema.options)}
        />
      </FieldRow>
      <FieldRow>
        <TextField
          label="Role"
          value={value.role}
          onChange={(v) => onChange({ ...value, role: v })}
          required
        />
        <TextField
          label="Organization"
          value={value.organization}
          onChange={(v) => onChange({ ...value, organization: v })}
          required
        />
      </FieldRow>
      <TextField
        label="Organization URL (optional)"
        value={value.organizationUrl ?? ''}
        onChange={(v) => onChange({ ...value, organizationUrl: v || undefined })}
      />
      <FieldRow>
        <TextField
          label="Start"
          value={value.start}
          onChange={(v) => onChange({ ...value, start: v })}
          hint="YYYY or YYYY-MM"
          required
        />
        <TextField
          label="End (optional — blank means present)"
          value={value.end ?? ''}
          onChange={(v) => onChange({ ...value, end: v || undefined })}
          hint="YYYY or YYYY-MM"
        />
      </FieldRow>
      <TextAreaField
        label="Summary"
        value={value.summary}
        onChange={(v) => onChange({ ...value, summary: v })}
        rows={3}
      />
      <ParagraphsField
        label="Highlights"
        value={value.highlights}
        onChange={(v) => onChange({ ...value, highlights: v })}
      />
      <ParagraphsField
        label="Tech stack"
        value={value.techStack}
        onChange={(v) => onChange({ ...value, techStack: v })}
        hint="Must match spellings in Skills"
      />
      <CheckboxField
        label="Published"
        checked={value.published}
        onChange={(checked) => onChange({ ...value, published: checked })}
        hint="Unpublished entries are kept in data but never rendered"
      />
    </div>
  )
}

/* ── Achievements ─────────────────────────────────────────────────────── */

export function AchievementForm({
  value,
  onChange,
}: {
  value: Achievement
  onChange: (value: Achievement) => void
}) {
  return (
    <div className="grid gap-6">
      <FieldRow>
        <TextField
          label="ID"
          value={value.id}
          onChange={(v) => onChange({ ...value, id: v })}
          required
        />
        <NumberField
          label="Year (optional)"
          value={value.year}
          onChange={(v) => onChange({ ...value, year: v })}
        />
      </FieldRow>
      <TextField
        label="Title"
        value={value.title}
        onChange={(v) => onChange({ ...value, title: v })}
        required
      />
      <TextAreaField
        label="Description (optional)"
        value={value.description ?? ''}
        onChange={(v) => onChange({ ...value, description: v || undefined })}
        rows={3}
      />
    </div>
  )
}

/* ── Certifications ───────────────────────────────────────────────────── */

export function CertificationForm({
  value,
  onChange,
}: {
  value: Certification
  onChange: (value: Certification) => void
}) {
  return (
    <div className="grid gap-6">
      <FieldRow>
        <TextField
          label="ID"
          value={value.id}
          onChange={(v) => onChange({ ...value, id: v })}
          required
        />
        <NumberField
          label="Year (optional)"
          value={value.year}
          onChange={(v) => onChange({ ...value, year: v })}
        />
      </FieldRow>
      <FieldRow>
        <TextField
          label="Name"
          value={value.name}
          onChange={(v) => onChange({ ...value, name: v })}
          required
        />
        <TextField
          label="Issuer"
          value={value.issuer}
          onChange={(v) => onChange({ ...value, issuer: v })}
          required
        />
      </FieldRow>
      <FieldRow>
        <TextField
          label="Verify URL (optional)"
          value={value.url ?? ''}
          onChange={(v) => onChange({ ...value, url: v || undefined })}
        />
        <TextField
          label="Credential ID (optional)"
          value={value.credentialId ?? ''}
          onChange={(v) => onChange({ ...value, credentialId: v || undefined })}
        />
      </FieldRow>
    </div>
  )
}

/* ── Uses ─────────────────────────────────────────────────────────────── */

export function UsesForm({
  value,
  onChange,
}: {
  value: UsesCategory
  onChange: (value: UsesCategory) => void
}) {
  return (
    <div className="grid gap-6">
      <FieldRow>
        <TextField
          label="ID"
          value={value.id}
          onChange={(v) => onChange({ ...value, id: v })}
          required
        />
        <TextField
          label="Category title"
          value={value.title}
          onChange={(v) => onChange({ ...value, title: v })}
          required
        />
      </FieldRow>
      <NoteListField
        label="Items"
        value={value.items}
        onChange={(v) => onChange({ ...value, items: v })}
      />
    </div>
  )
}

/* ── Now ──────────────────────────────────────────────────────────────── */

export function NowForm({ value, onChange }: { value: Now; onChange: (value: Now) => void }) {
  return (
    <div className="grid gap-6">
      <TextField
        label="Last updated"
        value={value.updatedAt}
        onChange={(v) => onChange({ ...value, updatedAt: v })}
        hint="YYYY-MM-DD — bump whenever your focus changes"
        required
      />
      <TextAreaField
        label="Note (optional)"
        value={value.note ?? ''}
        onChange={(v) => onChange({ ...value, note: v || undefined })}
        rows={3}
      />
    </div>
  )
}

/* ── Changelog ────────────────────────────────────────────────────────── */

export function ChangelogForm({
  value,
  onChange,
}: {
  value: ChangelogEntry
  onChange: (value: ChangelogEntry) => void
}) {
  return (
    <div className="grid gap-6">
      <FieldRow>
        <TextField
          label="Date"
          value={value.date}
          onChange={(v) => onChange({ ...value, date: v })}
          hint="YYYY-MM-DD"
          required
        />
        <SelectField
          label="Tag"
          value={value.tag}
          onChange={(v) => onChange({ ...value, tag: v as ChangelogEntry['tag'] })}
          options={toOptions(changelogTagSchema.options)}
        />
      </FieldRow>
      <TextField
        label="Title"
        value={value.title}
        onChange={(v) => onChange({ ...value, title: v })}
        required
      />
      <TextAreaField
        label="Description (optional)"
        value={value.description ?? ''}
        onChange={(v) => onChange({ ...value, description: v || undefined })}
        rows={3}
      />
    </div>
  )
}

/* ── Milestones ───────────────────────────────────────────────────────── */

export function MilestoneForm({
  value,
  onChange,
}: {
  value: Milestone
  onChange: (value: Milestone) => void
}) {
  return (
    <div className="grid gap-6">
      <FieldRow>
        <TextField
          label="ID"
          value={value.id}
          onChange={(v) => onChange({ ...value, id: v })}
          required
        />
        <TextField
          label="Date"
          value={value.date}
          onChange={(v) => onChange({ ...value, date: v })}
          hint="YYYY, YYYY-MM, or YYYY-MM-DD"
          required
        />
      </FieldRow>
      <TextField
        label="Title"
        value={value.title}
        onChange={(v) => onChange({ ...value, title: v })}
        required
      />
      <TextAreaField
        label="Description (optional)"
        value={value.description ?? ''}
        onChange={(v) => onChange({ ...value, description: v || undefined })}
        rows={3}
      />
    </div>
  )
}

/* ── Projects ─────────────────────────────────────────────────────────── */

interface ProjectAdvanced {
  stages?: ProjectInput['stages']
  metrics?: ProjectInput['metrics']
  engineering?: ProjectInput['engineering']
  architecture?: ProjectInput['architecture']
  relatedSlugs?: ProjectInput['relatedSlugs']
  seo?: ProjectInput['seo']
  favicon?: ProjectInput['favicon']
  cover?: ProjectInput['cover']
  gallery?: ProjectInput['gallery']
  caseStudy?: {
    challenges?: NonNullable<ProjectInput['caseStudy']>['challenges']
    tradeoffs?: NonNullable<ProjectInput['caseStudy']>['tradeoffs']
    futureImprovements?: NonNullable<ProjectInput['caseStudy']>['futureImprovements']
  }
}

function extractAdvanced(value: ProjectInput): ProjectAdvanced {
  return {
    stages: value.stages,
    metrics: value.metrics,
    engineering: value.engineering,
    architecture: value.architecture,
    relatedSlugs: value.relatedSlugs,
    seo: value.seo,
    favicon: value.favicon,
    cover: value.cover,
    gallery: value.gallery,
    caseStudy: {
      challenges: value.caseStudy?.challenges,
      tradeoffs: value.caseStudy?.tradeoffs,
      futureImprovements: value.caseStudy?.futureImprovements,
    },
  }
}

export function ProjectForm({
  value,
  onChange,
}: {
  value: ProjectInput
  onChange: (value: ProjectInput) => void
}) {
  const [advancedError, setAdvancedError] = useState<string | null>(null)
  const caseStudy = value.caseStudy ?? {}
  const setCaseStudy = <K extends keyof NonNullable<ProjectInput['caseStudy']>>(
    key: K,
    val: NonNullable<ProjectInput['caseStudy']>[K],
  ) => onChange({ ...value, caseStudy: { ...caseStudy, [key]: val } })

  return (
    <div className="grid gap-6">
      <FieldRow>
        <TextField
          label="Slug"
          value={value.slug}
          onChange={(v) => onChange({ ...value, slug: v })}
          hint="kebab-case, unique, used in the URL"
          required
        />
        <TextField
          label="Name"
          value={value.name}
          onChange={(v) => onChange({ ...value, name: v })}
          required
        />
      </FieldRow>
      <TextField
        label="Tagline"
        value={value.tagline}
        onChange={(v) => onChange({ ...value, tagline: v })}
        hint="One line under the name"
        required
      />
      <TextAreaField
        label="Summary"
        value={value.summary}
        onChange={(v) => onChange({ ...value, summary: v })}
        hint="2-3 sentences for cards and meta descriptions"
        rows={3}
      />
      <FieldRow>
        <SelectField
          label="Status"
          value={value.status}
          onChange={(v) => onChange({ ...value, status: v as ProjectInput['status'] })}
          options={toOptions(projectStatusSchema.options)}
        />
        <SelectField
          label="Difficulty (optional)"
          value={value.difficulty ?? ''}
          onChange={(v) =>
            onChange({ ...value, difficulty: (v || undefined) as ProjectInput['difficulty'] })
          }
          options={toOptions(projectDifficultySchema.options, 'Not set')}
        />
      </FieldRow>
      <FieldRow>
        <CheckboxField
          label="Featured"
          checked={value.featured ?? false}
          onChange={(checked) => onChange({ ...value, featured: checked })}
          hint="Shows on the home page"
        />
        <NumberField
          label="Featured order (optional)"
          value={value.featuredOrder}
          onChange={(v) => onChange({ ...value, featuredOrder: v })}
          hint="Lower appears first among featured projects"
        />
      </FieldRow>
      <ParagraphsField
        label="Categories"
        value={value.categories ?? []}
        onChange={(v) => onChange({ ...value, categories: v })}
        hint="Free-form grouping, e.g. web-app, startup, ai"
      />
      <FieldRow>
        <TextField
          label="Role"
          value={value.role}
          onChange={(v) => onChange({ ...value, role: v })}
          required
        />
        <NumberField
          label="Team size"
          value={value.teamSize}
          onChange={(v) => onChange({ ...value, teamSize: v })}
        />
      </FieldRow>
      <FieldGroup title="Timeline">
        <FieldRow>
          <TextField
            label="Start"
            value={value.timeline.start}
            onChange={(v) => onChange({ ...value, timeline: { ...value.timeline, start: v } })}
            hint="YYYY, YYYY-MM, or YYYY-MM-DD"
            required
          />
          <TextField
            label="End (optional)"
            value={value.timeline.end ?? ''}
            onChange={(v) =>
              onChange({ ...value, timeline: { ...value.timeline, end: v || undefined } })
            }
          />
        </FieldRow>
      </FieldGroup>
      <FieldRow>
        <TextField
          label="Version (optional)"
          value={value.version ?? ''}
          onChange={(v) => onChange({ ...value, version: v || undefined })}
        />
        <TextField
          label="Published at (optional)"
          value={value.publishedAt ?? ''}
          onChange={(v) => onChange({ ...value, publishedAt: v || undefined })}
        />
      </FieldRow>
      <TextField
        label="Updated at (optional)"
        value={value.updatedAt ?? ''}
        onChange={(v) => onChange({ ...value, updatedAt: v || undefined })}
      />
      <ParagraphsField
        label="Tech stack"
        value={value.techStack}
        onChange={(v) => onChange({ ...value, techStack: v })}
        hint="Must match names in Skills — drives search-by-technology and evidence"
      />
      <FieldGroup title="Links">
        <FieldRow>
          <TextField
            label="Live URL (optional)"
            value={value.links?.live ?? ''}
            onChange={(v) => onChange({ ...value, links: { ...value.links, live: v || undefined } })}
          />
          <TextField
            label="GitHub URL (optional)"
            value={value.links?.github ?? ''}
            onChange={(v) =>
              onChange({ ...value, links: { ...value.links, github: v || undefined } })
            }
          />
        </FieldRow>
      </FieldGroup>

      <FieldGroup title="Case study — narrative sections (add over time)">
        <ParagraphsField
          label="Overview"
          value={caseStudy.overview ?? []}
          onChange={(v) => setCaseStudy('overview', v)}
          rows={3}
        />
        <ParagraphsField
          label="Problem"
          value={caseStudy.problem ?? []}
          onChange={(v) => setCaseStudy('problem', v)}
          rows={3}
        />
        <ParagraphsField
          label="Research"
          value={caseStudy.research ?? []}
          onChange={(v) => setCaseStudy('research', v)}
          rows={3}
        />
        <ParagraphsField
          label="Planning"
          value={caseStudy.planning ?? []}
          onChange={(v) => setCaseStudy('planning', v)}
          rows={3}
        />
        <ParagraphsField
          label="Architecture notes"
          value={caseStudy.architecture ?? []}
          onChange={(v) => setCaseStudy('architecture', v)}
          rows={3}
        />
        <ParagraphsField
          label="Database"
          value={caseStudy.database ?? []}
          onChange={(v) => setCaseStudy('database', v)}
          rows={3}
        />
        <ParagraphsField
          label="Implementation"
          value={caseStudy.implementation ?? []}
          onChange={(v) => setCaseStudy('implementation', v)}
          rows={3}
        />
        <ParagraphsField
          label="Lessons"
          value={caseStudy.lessons ?? []}
          onChange={(v) => setCaseStudy('lessons', v)}
          rows={3}
        />
      </FieldGroup>

      <FieldGroup title="Advanced (JSON)">
        <p className="text-small text-muted-foreground">
          Stages, metrics, engineering numbers, the architecture diagram, structured
          challenges/tradeoffs/roadmap, gallery, related projects, and SEO overrides. See
          docs/CONTENT-GUIDE.md for the shape of each field.
        </p>
        <JsonField
          label="Advanced fields"
          value={extractAdvanced(value)}
          onChange={(parsed, error) => {
            setAdvancedError(error)
            if (error) return
            const advanced = parsed as ProjectAdvanced
            onChange({
              ...value,
              stages: advanced.stages,
              metrics: advanced.metrics,
              engineering: advanced.engineering,
              architecture: advanced.architecture,
              relatedSlugs: advanced.relatedSlugs,
              seo: advanced.seo,
              favicon: advanced.favicon,
              cover: advanced.cover,
              gallery: advanced.gallery,
              caseStudy: {
                ...caseStudy,
                challenges: advanced.caseStudy?.challenges,
                tradeoffs: advanced.caseStudy?.tradeoffs,
                futureImprovements: advanced.caseStudy?.futureImprovements,
              },
            })
          }}
        />
        {advancedError ? <p className="text-small text-danger">{advancedError}</p> : null}
      </FieldGroup>
    </div>
  )
}

/* ── Open source ──────────────────────────────────────────────────────── */

export function OpenSourceForm({
  value,
  onChange,
}: {
  value: OpenSourceContribution
  onChange: (value: OpenSourceContribution) => void
}) {
  return (
    <div className="grid gap-6">
      <FieldRow>
        <TextField
          label="ID"
          value={value.id}
          onChange={(v) => onChange({ ...value, id: v })}
          required
        />
        <NumberField
          label="Year (optional)"
          value={value.year}
          onChange={(v) => onChange({ ...value, year: v })}
        />
      </FieldRow>
      <TextField
        label="Project"
        value={value.project}
        onChange={(v) => onChange({ ...value, project: v })}
        hint="e.g. owner/repo"
        required
      />
      <TextAreaField
        label="Description"
        value={value.description}
        onChange={(v) => onChange({ ...value, description: v })}
        rows={3}
      />
      <FieldRow>
        <TextField
          label="URL"
          value={value.url}
          onChange={(v) => onChange({ ...value, url: v })}
          hint="Link to the PR, issue, or repo"
          required
        />
        <TextField
          label="Role (optional)"
          value={value.role ?? ''}
          onChange={(v) => onChange({ ...value, role: v || undefined })}
        />
      </FieldRow>
    </div>
  )
}

/* ── Reading ──────────────────────────────────────────────────────────── */

export function ReadingForm({
  value,
  onChange,
}: {
  value: ReadingItem
  onChange: (value: ReadingItem) => void
}) {
  return (
    <div className="grid gap-6">
      <FieldRow>
        <TextField
          label="ID"
          value={value.id}
          onChange={(v) => onChange({ ...value, id: v })}
          required
        />
        <SelectField
          label="Status"
          value={value.status}
          onChange={(v) => onChange({ ...value, status: v as ReadingItem['status'] })}
          options={toOptions(readingStatusSchema.options)}
        />
      </FieldRow>
      <FieldRow>
        <TextField
          label="Title"
          value={value.title}
          onChange={(v) => onChange({ ...value, title: v })}
          required
        />
        <TextField
          label="Author"
          value={value.author}
          onChange={(v) => onChange({ ...value, author: v })}
          required
        />
      </FieldRow>
      <FieldRow>
        <TextField
          label="URL (optional)"
          value={value.url ?? ''}
          onChange={(v) => onChange({ ...value, url: v || undefined })}
        />
        <TextField
          label="Finished at (optional)"
          value={value.finishedAt ?? ''}
          onChange={(v) => onChange({ ...value, finishedAt: v || undefined })}
          hint="YYYY-MM-DD"
        />
      </FieldRow>
      <TextAreaField
        label="Note (optional)"
        value={value.note ?? ''}
        onChange={(v) => onChange({ ...value, note: v || undefined })}
        rows={3}
      />
    </div>
  )
}

/* ── Speaking ─────────────────────────────────────────────────────────── */

export function SpeakingForm({
  value,
  onChange,
}: {
  value: SpeakingEngagement
  onChange: (value: SpeakingEngagement) => void
}) {
  return (
    <div className="grid gap-6">
      <FieldRow>
        <TextField
          label="ID"
          value={value.id}
          onChange={(v) => onChange({ ...value, id: v })}
          required
        />
        <TextField
          label="Date"
          value={value.date}
          onChange={(v) => onChange({ ...value, date: v })}
          hint="YYYY, YYYY-MM, or YYYY-MM-DD"
          required
        />
      </FieldRow>
      <FieldRow>
        <TextField
          label="Title"
          value={value.title}
          onChange={(v) => onChange({ ...value, title: v })}
          required
        />
        <TextField
          label="Event"
          value={value.event}
          onChange={(v) => onChange({ ...value, event: v })}
          required
        />
      </FieldRow>
      <TextField
        label="URL (optional)"
        value={value.url ?? ''}
        onChange={(v) => onChange({ ...value, url: v || undefined })}
      />
      <TextAreaField
        label="Description (optional)"
        value={value.description ?? ''}
        onChange={(v) => onChange({ ...value, description: v || undefined })}
        rows={3}
      />
    </div>
  )
}

/* ── Resume ───────────────────────────────────────────────────────────── */

export function ResumeForm({ value, onChange }: { value: Resume; onChange: (value: Resume) => void }) {
  return (
    <div className="grid gap-6">
      <TextField
        label="Last updated (optional)"
        value={value.updatedAt ?? ''}
        onChange={(v) => onChange({ ...value, updatedAt: v || undefined })}
        hint="YYYY-MM-DD"
      />
      <JsonField
        label="Versions"
        value={value.versions}
        onChange={(parsed) => onChange({ ...value, versions: parsed as Resume['versions'] })}
        hint={'Array of { id, label, url, note? } — url must point under /public, e.g. /resume/abdul-rehman.pdf'}
      />
    </div>
  )
}

/* ── Registry of form components by collection key ───────────────────── */

type FormComponent = ComponentType<{ value: any; onChange: (value: any) => void }>

export const collectionForms: Record<CollectionKey, FormComponent> = {
  profile: ProfileForm,
  socials: SocialForm,
  seo: SeoForm,
  education: EducationForm,
  skills: SkillsForm,
  experience: ExperienceForm,
  achievements: AchievementForm,
  projects: ProjectForm,
  certifications: CertificationForm,
  uses: UsesForm,
  now: NowForm,
  changelog: ChangelogForm,
  milestones: MilestoneForm,
  openSource: OpenSourceForm,
  reading: ReadingForm,
  speaking: SpeakingForm,
  resume: ResumeForm,
}
