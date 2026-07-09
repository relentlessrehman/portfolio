import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { buildSearchIndex } from '../lib/build-index'
import { OPEN_COMMAND_PALETTE_EVENT } from '../lib/palette-events'
import { cn } from '#/lib/utils'
import type { SearchEntry, SearchEntryType } from '../lib/build-index'
import type Fuse from 'fuse.js'

const GROUP_LABELS: Record<SearchEntryType, string> = {
  page: 'Pages',
  project: 'Projects',
  post: 'Writing',
  skill: 'Skills',
}
const GROUP_ORDER: Array<SearchEntryType> = ['project', 'post', 'skill', 'page']
const DEFAULT_RESULT_COUNT = 8
const LISTBOX_ID = 'search-results'

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
  )
}

/**
 * Global search — Ctrl/Cmd+K (or a Navbar button) opens a native <dialog>
 * with a lazily-loaded Fuse index over projects, writing, skills, and pages.
 * Technology-aware: skill entries surface the projects that use them, and
 * project keywords include their tech stack, so searching "React" finds both.
 */
export function CommandPalette() {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [fuse, setFuse] = useState<Fuse<SearchEntry> | null>(null)
  const [entries, setEntries] = useState<Array<SearchEntry>>([])
  const navigate = useNavigate()

  async function open() {
    // Defer index building to first open (fix 9.2)
    let currentEntries = entries
    if (currentEntries.length === 0) {
      currentEntries = buildSearchIndex()
      setEntries(currentEntries)
    }
    if (!fuse) {
      const { default: FuseCtor } = await import('fuse.js')
      setFuse(
        new FuseCtor(currentEntries, {
          keys: [
            { name: 'title', weight: 3 },
            { name: 'subtitle', weight: 1.5 },
            { name: 'keywords', weight: 1 },
          ],
          threshold: 0.35,
          ignoreLocation: true,
        }),
      )
    }
    dialogRef.current?.showModal()
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  function close() {
    dialogRef.current?.close()
    setQuery('')
    setActiveIndex(0)
  }

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      const isOpen = dialogRef.current?.open
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        if (isOpen) close()
        else void open()
      } else if (event.key === '/' && !isOpen && !isTypingTarget(event.target)) {
        event.preventDefault()
        void open()
      }
    }
    function handleOpenEvent() {
      void open()
    }
    window.addEventListener('keydown', handleKeydown)
    window.addEventListener(OPEN_COMMAND_PALETTE_EVENT, handleOpenEvent)
    return () => {
      window.removeEventListener('keydown', handleKeydown)
      window.removeEventListener(OPEN_COMMAND_PALETTE_EVENT, handleOpenEvent)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fuse, entries])

  const results: Array<SearchEntry> =
    query.trim() && fuse
      ? fuse.search(query.trim()).map((result) => result.item)
      : entries.slice(0, DEFAULT_RESULT_COUNT)

  const grouped = GROUP_ORDER.map((type) => ({
    type,
    items: results.filter((entry) => entry.type === type),
  })).filter((group) => group.items.length > 0)

  const flat = grouped.flatMap((group) => group.items)
  const activeItem = flat[activeIndex]
  const activeOptionId = activeItem ? `search-option-${activeItem.id}` : undefined

  function goTo(entry: SearchEntry) {
    close()
    navigate({ to: entry.href })
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => Math.min(index + 1, Math.max(flat.length - 1, 0)))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => Math.max(index - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const entry = flat[activeIndex]
      if (entry) goTo(entry)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={close}
      onClick={(event) => {
        if (event.target === dialogRef.current) close()
      }}
      aria-label="Search"
      className="m-auto mt-[12vh] w-[min(92vw,38rem)] overflow-hidden rounded-lg border border-border bg-background p-0 backdrop:bg-background/85"
    >
      <div onKeyDown={handleKeyDown}>
        <div className="flex items-center gap-2.5 border-b border-border px-4">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setActiveIndex(0)
            }}
            placeholder="Search projects, writing, skills…"
            className="h-12 w-full bg-transparent text-body text-foreground outline-none placeholder:text-muted-foreground"
            role="combobox"
            aria-label="Search"
            aria-expanded={flat.length > 0}
            aria-controls={LISTBOX_ID}
            aria-activedescendant={activeOptionId}
            aria-autocomplete="list"
          />
          <kbd className="hidden shrink-0 rounded-sm border border-border px-1.5 py-0.5 font-mono text-mono-sm text-muted-foreground sm:inline">
            Esc
          </kbd>
        </div>
        <div
          id={LISTBOX_ID}
          role="listbox"
          aria-label="Search results"
          className="max-h-[60vh] overflow-y-auto p-2"
        >
          {flat.length === 0 ? (
            <p className="p-4 text-small text-muted-foreground">No results for &ldquo;{query}&rdquo;.</p>
          ) : (
            grouped.map((group) => (
              <div key={group.type} role="group" aria-label={GROUP_LABELS[group.type]} className="mb-1 last:mb-0">
                <p className="px-3 pt-3 pb-1 text-small font-medium text-muted-foreground" aria-hidden>
                  {GROUP_LABELS[group.type]}
                </p>
                {group.items.map((item) => {
                  const flatIndex = flat.indexOf(item)
                  const optionId = `search-option-${item.id}`
                  const isActive = flatIndex === activeIndex
                  return (
                    <div
                      key={item.id}
                      id={optionId}
                      role="option"
                      aria-selected={isActive}
                      onClick={() => goTo(item)}
                      onMouseEnter={() => setActiveIndex(flatIndex)}
                      className={cn(
                        'block w-full cursor-pointer rounded-md px-3 py-2 text-left transition-colors duration-(--duration-fast)',
                        isActive
                          ? 'bg-accent-muted text-foreground'
                          : 'text-muted-foreground hover:bg-surface',
                      )}
                    >
                      <span className="block text-body text-foreground">{item.title}</span>
                      {item.subtitle ? (
                        <span className="block truncate text-small text-muted-foreground">
                          {item.subtitle}
                        </span>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </dialog>
  )
}
