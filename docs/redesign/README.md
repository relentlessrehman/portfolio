# Redesign v2: "a short film about someone who builds things"

The full redesign of the portfolio, specified before any code is written. Start with
[`/DESIGN.md`](../../DESIGN.md) (the creative bible). The files here are the detail.

| Doc | Answers |
|---|---|
| [DESIGN.md](../../DESIGN.md) | What it looks and feels like: concept, the Core, camera grammar, colour, type, components, modes |
| [STORYBOARD.md](STORYBOARD.md) | Exactly what happens in each of the 14 scenes, beat by beat, desktop and mobile |
| [ENGINEERING.md](ENGINEERING.md) | How it's built: stack, module layout, layer sandwich, scroll/time model, WebGL, testing |
| [PERFORMANCE.md](PERFORMANCE.md) | Budgets, measured evidence (bundle sizes, GPU spike), quality tiers, test protocol |
| [RESPONSIVE.md](RESPONSIVE.md) | Screen classes, mobile browser chrome, per-scene adaptation, viewport test matrix |
| [ACCESSIBILITY.md](ACCESSIBILITY.md) | Motion safety, screen readers, keyboard, contrast, SEO |
| [CONTENT.md](CONTENT.md) | Verified facts for every project (from `E:\Startups`), what the reference got wrong, remaining assets |
| [STRESS-TEST.md](STRESS-TEST.md) | The brief tested against every constraint, plus the findings made during the build (38 total) |
| [ROADMAP.md](ROADMAP.md) | Phases 0–8 with exit gates |

## Decisions at a glance

- Keep **TanStack Start**. Redesign the presentation layer; content, backend, Studio and SEO
  carry over.
- **Vanilla three.js** (one fixed canvas) + **one paused GSAP timeline** driven by a
  pure scroll→time function + **Lenis with directed scrolling** (speed cap, stops) +
  **CSS sticky layers**.
- **Geist + Geist Mono**, a water-droplet Core, and Liquid Glass chrome.
- **Three modes from one markup:** `film`, `film-lite`, `static` (reduced motion / no
  JS = a designed editorial page, not a fallback).
- Everything visual is a **pure function of scroll**: reversible, jumpable,
  screenshot-testable.
- **Real content only.** The reference's timeline, portrait, experiments, Madad "RAG"
  framing and CampusFlow features are placeholders and won't ship.

## Superseded

`docs/DESIGN-SYSTEM.md` (v1 tokens/type/motion) is replaced by `/DESIGN.md`.
`docs/ARCHITECTURE.md` remains valid for content, routing, backend and search. The film's
architecture is in `ENGINEERING.md`.
