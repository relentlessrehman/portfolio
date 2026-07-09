import { cn } from '#/lib/utils'
import type { ChangeEvent, ReactNode } from 'react'

/*
 * Shared form primitives for the Studio. Deliberately plain controlled
 * inputs (no form library) — this is a local, dev-only editing tool, not
 * a form users on the public site interact with.
 */

interface ShellProps {
  label: string
  hint?: string
  children: ReactNode
  htmlFor?: string
}

function FieldShell({ label, hint, children, htmlFor }: ShellProps) {
  return (
    <label htmlFor={htmlFor} className="grid gap-1.5">
      <span className="text-small font-medium text-foreground">{label}</span>
      {children}
      {hint ? <span className="text-small text-muted-foreground">{hint}</span> : null}
    </label>
  )
}

const inputClass =
  'h-11 w-full rounded-md border border-border bg-surface px-3 text-body text-foreground ' +
  'placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 ' +
  'focus-visible:outline-ring'

const textareaClass = cn(inputClass, 'h-auto min-h-24 py-2 leading-relaxed')

interface TextFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  hint?: string
  placeholder?: string
  required?: boolean
  type?: string
}

export function TextField({
  label,
  value,
  onChange,
  hint,
  placeholder,
  required,
  type = 'text',
}: TextFieldProps) {
  return (
    <FieldShell label={label} hint={hint}>
      <input
        type={type}
        className={inputClass}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </FieldShell>
  )
}

interface NumberFieldProps {
  label: string
  value: number | undefined
  onChange: (value: number | undefined) => void
  hint?: string
  min?: number
  max?: number
}

export function NumberField({ label, value, onChange, hint, min, max }: NumberFieldProps) {
  return (
    <FieldShell label={label} hint={hint}>
      <input
        type="number"
        className={inputClass}
        value={value ?? ''}
        min={min}
        max={max}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          const raw = event.target.value
          onChange(raw === '' ? undefined : Number(raw))
        }}
      />
    </FieldShell>
  )
}

interface TextAreaFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  hint?: string
  rows?: number
}

export function TextAreaField({ label, value, onChange, hint, rows = 4 }: TextAreaFieldProps) {
  return (
    <FieldShell label={label} hint={hint}>
      <textarea
        className={textareaClass}
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </FieldShell>
  )
}

interface ParagraphsFieldProps {
  label: string
  value: Array<string>
  onChange: (value: Array<string>) => void
  hint?: string
  rows?: number
}

/** One line = one array entry. Blank lines are dropped on change. */
export function ParagraphsField({
  label,
  value,
  onChange,
  hint = 'One per line',
  rows = 4,
}: ParagraphsFieldProps) {
  return (
    <FieldShell label={label} hint={hint}>
      <textarea
        className={textareaClass}
        rows={rows}
        defaultValue={value.join('\n')}
        onBlur={(event) =>
          onChange(
            event.target.value
              .split('\n')
              .map((line) => line.trim())
              .filter(Boolean),
          )
        }
      />
    </FieldShell>
  )
}

interface NoteListItem {
  name: string
  note?: string
  url?: string
}

interface NoteListFieldProps {
  label: string
  value: Array<NoteListItem>
  onChange: (value: Array<NoteListItem>) => void
  hint?: string
}

/** Line format: `Name | note | url` — note and url are optional. */
export function NoteListField({
  label,
  value,
  onChange,
  hint = 'One per line: Name | note | url (note and url optional)',
}: NoteListFieldProps) {
  const text = value
    .map((item) => [item.name, item.note, item.url].filter(Boolean).join(' | '))
    .join('\n')
  return (
    <FieldShell label={label} hint={hint}>
      <textarea
        className={textareaClass}
        rows={4}
        defaultValue={text}
        onBlur={(event) =>
          onChange(
            event.target.value
              .split('\n')
              .map((line) => line.trim())
              .filter(Boolean)
              .map((line) => {
                const [name, note, url] = line.split('|').map((part) => part.trim())
                return { name, note: note || undefined, url: url || undefined }
              })
              .filter((item) => item.name),
          )
        }
      />
    </FieldShell>
  )
}

interface SelectFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: ReadonlyArray<{ value: string; label: string }>
  hint?: string
}

export function SelectField({ label, value, onChange, options, hint }: SelectFieldProps) {
  return (
    <FieldShell label={label} hint={hint}>
      <select
        className={inputClass}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  )
}

interface CheckboxFieldProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  hint?: string
}

export function CheckboxField({ label, checked, onChange, hint }: CheckboxFieldProps) {
  return (
    <label className="flex items-start gap-3">
      <input
        type="checkbox"
        className="mt-1 size-4 rounded-sm border-border accent-accent"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="grid gap-0.5">
        <span className="text-small font-medium text-foreground">{label}</span>
        {hint ? <span className="text-small text-muted-foreground">{hint}</span> : null}
      </span>
    </label>
  )
}

interface JsonFieldProps {
  label: string
  value: unknown
  onChange: (value: unknown, error: string | null) => void
  hint?: string
  rows?: number
}

/** Advanced fallback for deeply nested structures — validated as JSON only; schema errors surface on save. */
export function JsonField({ label, value, onChange, hint, rows = 12 }: JsonFieldProps) {
  return (
    <FieldShell label={label} hint={hint}>
      <textarea
        className={cn(textareaClass, 'font-mono text-small')}
        rows={rows}
        defaultValue={JSON.stringify(value, null, 2)}
        onBlur={(event) => {
          try {
            onChange(JSON.parse(event.target.value), null)
          } catch {
            onChange(value, 'Invalid JSON — changes in this box were not applied.')
          }
        }}
      />
    </FieldShell>
  )
}

export function FieldRow({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>
}

export function FieldGroup({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="grid gap-4 rounded-lg border border-border bg-surface/50 p-4">
      {title ? <h3 className="text-small font-semibold text-foreground">{title}</h3> : null}
      {children}
    </div>
  )
}
