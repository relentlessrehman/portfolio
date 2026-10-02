# Accessibility, motion safety, SEO

Target: **WCAG 2.2 AA** across all modes, plus **2.3.3 Animation from Interactions
(AAA)**, because a scroll-driven film is exactly the case that criterion exists for.
Keep the current Lighthouse Accessibility 100.

## 1. Motion safety

Large-scale zoom, parallax, simulated 3D and fly-throughs are the classic vestibular
triggers, and this film uses all of them. So:

- **`prefers-reduced-motion: reduce` → `static` mode** by default (Engineering §3).
  It's not a stripped page: it's the designed editorial version (Design §11).
- **Visible Motion toggle** (`MOTION: ON / OFF`) in the nav and footer. Many people
  who get motion sick don't know the OS setting exists. The toggle is persisted, works
  both ways (someone with reduced-motion set *can* opt into the film), and switches
  live without reload.
- No flashing: no frame transition exceeds the WCAG 2.3.1 general flash threshold. The
  beam/ripple (03) and the paper flood (07) ramp over ≥ 30% of their scene. Checked by
  inspecting luminance deltas between consecutive frames in the perf-scroll trace.
- **2.2.2 Pause, Stop, Hide:** the only auto-moving content is the Core's idle float
  (≤ 0.6% amplitude) and breathing light. It's below the "moving content" bar in
  spirit, but it still stops under reduced motion and when Motion is off.
- **Directed scrolling (owner decision, 2026-10-02).** In film modes the film sets the
  pace: wheel and touch speed are capped, and stops at each beat hold briefly. This
  departs from this doc's original "never hijack scroll" rule. Mitigations:
  - It never applies in `static` mode (reduced motion, Motion off, no JS). Native
    scroll is untouched there.
  - Keyboard users step stop to stop with `↓`/`PageDown`/`Space` (and back), which is
    *more* predictable than native scrolling through a pinned film.
  - Skip links, the chapter rail and hash links glide straight to any scene.
  - Holds last about half a second and the next gesture always continues. The page
    never traps input or locks indefinitely.
  - The native scrollbar still works, and inputs/dialogs are never intercepted.

## 2. Screen readers and document semantics

- All film text is SSR'd semantic HTML **in narrative order**:
  ```
  h1  Abdul Rehman
    h2  I build products for problems worth solving.        (02)
    h2  Stayza          → p, a "View case study", a "Visit stayza.pk"
    h3  Listings / Accounts & roles / Verification / Admin dashboard   (05)
    h2  CampusFlow …    h2  Madad …     h3 pipeline steps as an <ol>
    h2  Behind the work … h2 Timeline (<ol>) … h2 Experiments (<ul> of links)
    h2  Let's build something worthwhile.  → contact links
  footer (credits) nav
  ```
- `<canvas>`, the props layer, device frames, decorative duplicates and the grain are
  `aria-hidden="true"`. The canvas also gets `role="presentation"`.
- Words that are visually split or animated per-word (02's statement, 13's headline)
  are rendered as **one text node for AT** (`aria-label` on the heading, or visually-hidden
  full text + `aria-hidden` animated spans). The current Typewriter component's
  `sr-only` pattern is reused.
- The Core-as-period (13): the real `.` stays in the text and is visually transparent,
  so copying, translating and reading all work.
- Content hidden by choreography stays **in the accessibility tree** (opacity, not
  `display:none`/`visibility:hidden`), so screen reader users get the whole story at
  their own pace without scrolling-to-reveal.
- Each scene `<section>` has `aria-labelledby` pointing at its heading; chapter rail
  buttons announce "Chapter 2 of 5: The work".
- Live region: none. Nothing in the film announces itself; it's a document.

## 3. Keyboard

- A skip link as the first focusable element, with two targets: **"Skip to work"**
  (→ #stayza) and **"Skip to contact"** (→ #contact). Visible on focus.
- Tab order follows the narrative. On `focusin`, **focus-follow** scrolls to the beat
  where the focused element is revealed (Engineering §7), so you never focus an invisible
  link.
- `Space`, `PageDown`, `Arrow` keys and `Home`/`End` scroll natively. Lenis doesn't
  intercept keys.
- Chapter rail: a `<nav aria-label="Chapters">` of `<a href="#…">` (real links, so they
  work in static mode and without JS).
- Focus ring: 2px `--core`, 3px offset. Verified visible over every scene background,
  including paper (lavender on `#F7F7F5` is only 2.1:1, so **on paper the ring switches to
  `--paper-ink`**, 18.9:1).
- The experiments carousel on compact is a native scrollable list. Each card is a link;
  arrow-key scrolling works when focused.

## 4. Visual

- Text contrast is checked **at each scene's hold frame**, over the actual background
  pixels (the Core, product images and portrait can sit behind text). Scrims (void
  gradients ≤ 70%) are added where needed. Automated: axe at hold frames.
  Manual: sampled contrast for text over imagery.
- Minimum sizes: body 16px, labels 11px uppercase with +0.18em tracking, `--fg-subtle`
  ≥ 4.8:1.
- Non-text contrast (1.4.11): pill borders `--hairline-strong` ≥ 3:1 against void;
  index-list active tick `--core` 9.1:1.
- Target size (2.5.8): every interactive element ≥ 24×24, primary ones ≥ 44×44.
- **Find-in-page:** Ctrl+F on a word in a later scene scrolls the browser to that
  scene's sticky layer, but the text may still be at its pre-reveal opacity. Mitigation:
  where the browser exposes the match as a selection (Firefox does; Chrome does when the
  find bar closes), a `selectionchange` handler runs focus-follow for that element's
  beat. Elsewhere it's a known minor limitation, and `static` mode has no such issue.
  Verify per browser in Phase 6.

## 5. Forms and the rest of the site

- The contact form moves to `/contact` (no form inside the film). Fix the existing
  audit items while restyling it: `aria-describedby` on inputs → error messages
  (audit 2.5), `aria-invalid`.
- Fix the existing audit items that survive the redesign: page `<h1>`s on inner pages
  (2.1), `<dt>`/`<dd>` order (2.2), command palette combobox semantics (2.3), reading
  progress shown statically under reduced motion (2.4), external-link indicators (2.6).
  (See `ui_ux_audit.md`.)

## 6. SEO

- **All content is in the server HTML.** Crawlers see the full narrative, headings and
  links without running JS. The film is enhancement only.
- One `h1`. Meaningful `h2`s per scene (not "Scene 04").
- Each hero project scene links to its `/projects/<slug>` case study (the indexable
  depth). Experiments link to theirs.
- JSON-LD: keep `Person`. Add `ItemList` of featured `CreativeWork`s (Stayza,
  CampusFlow, Madad) on the home page.
- Hash URLs (`/#stayza`) are for in-film navigation only. Canonical stays `/`.
- New OG image: still render of the Core + name, generated by the existing
  `npm run brand:assets` pipeline from the new tokens.
- LCP / CLS / INP budgets protect ranking signals (Performance §2).
- Title/description updated to the new positioning: *"Abdul Rehman · Software
  engineer, product builder, founder of Stayza"* (final copy in CONTENT.md).

## 7. Verification checklist (per phase gate)

- [ ] axe: 0 violations at every hold frame, `film` and `static`
- [ ] Keyboard-only run through the whole film: every link reachable and visible when focused
- [ ] NVDA + Firefox and VoiceOver + Safari (iOS) read the home page start to finish in order
- [ ] Reduced motion on → static mode, no parallax/zoom anywhere
- [ ] Motion toggle works in both directions, persists, and switches live
- [ ] 200% zoom and text-spacing bookmarklet: no clipping
- [ ] Lighthouse A11y 100, SEO 100
