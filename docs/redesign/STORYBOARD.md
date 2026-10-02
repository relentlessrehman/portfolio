# Storyboard: scene-by-scene spec

Each scene is specified so it can be built, reviewed and tested on its own. Conventions:

- **Length** = how far the user scrolls while the scene's stage is pinned, in viewport
  heights (`vh`). **D** = desktop/tablet, **M** = phone portrait. Scenes overlap their
  neighbours by one viewport, so total document height ≈ Σ lengths + 1 vh
  (Engineering §4).
- **p** = the scene's local progress, 0 → 1. Beats are ranges of `p`. **HOLD** beats
  are where only reading happens.
- **Layers** (back → front): `back` text · `props` (fixed, decorative devices/imagery) ·
  `gl` (the Core, particles, ripple) · `front` text/UI · `chrome` (nav, rail).
- **Copy** comes from verified sources (see [CONTENT.md](CONTENT.md)). Proposed
  taglines marked ✎ are awaiting Abdul's approval (CONTENT §7). No unverified fact ships.
- **Static** = what the scene looks like in `static` mode (reduced motion / no JS).

| # | Scene | Act | D | M | Core state |
|---|---|---|---|---|---|
| 01 | Intro | I | 150 | 110 | spark → orb |
| 02 | Identity | I | 300 | 220 | lead |
| 03 | The Drop | I | 150 | 120 | drop |
| 04 | Stayza | II | 200 | 160 | guide |
| 05 | Stayza, up close | II | 250 | 200 | guide |
| 06 | Web → Mobile | II | 150 | 120 | tracer |
| 07 | CampusFlow | II | 250 | 200 | ink |
| 08 | Madad | III | 200 | 160 | swarm |
| 09 | Under the hood | III | 200 | 160 | swarm → orb |
| 10 | Behind the work | IV | 200 | 160 | refract |
| 11 | Timeline | IV | 220 | 200 | marker |
| 12 | Toolkit *(added 2026-10-02)* | IV | 200 | 180 | scanner |
| 13 | More work | V | 150 | 150 | satellite |
| 14 | Let's build | V | 150 | 120 | period |
| 15 | Outro → Credits | V | 100 | 100 | horizon |
| | **Total** | | **2870** | **2360** | |

> **As built (2026-10-02):** type is Geist, mixed case ("Stayza.", "Let's build
> something worthwhile."). Headlines rise from behind masks instead of sliding. Every
> scene has **stops** (`config/scenes.ts`) where directed scrolling holds. The sections
> below keep their original numbering for 01–11. Scene 12 is new (below), and the old
> 12/13/14 are now 13/14/15.

---

## ACT I: ARRIVAL · forward and down

### 01 · Intro

**Purpose:** say who this is, in one word-pair, before anything else.

**Time-based opening** (not scroll). First visit per session only. Skipped instantly if
the user scrolls, presses a key or has reduced motion.

| t | Event |
|---|---|
| 0–300ms | Void. Nav hidden. (Kept ≤ 300ms. The name is the LCP element, see Performance §2) |
| 300–900ms | The spark: a CSS radial point of `--core` light fades in at the stage centre, slightly above the middle |
| 500–1300ms | `ABDUL REHMAN` rises 2% and goes opacity 0.001 → 1 (CSS, not JS, so it doesn't wait for hydration). Corner labels follow at +150ms stagger |
| when WebGL ready | Spark → `orb`: the CSS light crossfades into the WebGL Core over 600ms while it grows to 1.0×. If WebGL never arrives, a still Core render (AVIF) takes the spark's place |

**Scroll beats**

| p | Beat |
|---|---|
| 0.00–0.15 | **HOLD.** Name centred-low, Core above it, labels in corners |
| 0.15–0.70 | Name parts like we're travelling *through* it. `ABDUL` moves to −45vw and scales 1→1.5; `REHMAN` moves to +45vw and scales 1→1.5. **Opacity stays 1 until each word is off-screen** (it's a move, not a fade). The Core pushes toward the camera (1.0→1.3×) and drifts toward the lower right |
| 0.70–0.85 | Corner labels exit downward (8vh) |
| 0.85–1.00 | Nav fades in. Chapter rail appears (`01` active) |

**Layers:** name → `back` (the Core passes in front of it); labels → `front`.

**Copy**
- h1: `Abdul Rehman` (rendered uppercase)
- Top-left: `A builder based in Islamabad`. The reference says "from Islamabad", but he's
  from Samundri and based in Islamabad.
- Top-right: `Computer Science · Startups · Meaningful products`
- Bottom: `Scroll to explore` + a 1px scroll line

**Mobile:** the name wraps onto two lines (`ABDUL` / `REHMAN`). The parting is vertical:
`ABDUL` exits up, `REHMAN` exits down, because ±45vw on a 375px screen is only 170px of
travel and would read as a nudge.

**Static:** the hold frame. Name, still Core render, corner labels.

---

### 02 · Identity

**Purpose:** establish him in three words and one sentence. No biography.

| p | Beat |
|---|---|
| 0.00–0.05 | Core arrives upper-left of centre (from 01's lower-right push it glides across, forward/down feel) |
| 0.05–0.22 | `COMPUTER SCIENCE.` enters from the left in the `back` layer, **passes behind the Core**, settles top-left. The Core travels diagonally toward the lower right (whole scene: −10vw,−8vh → +18vw,+6vh) |
| 0.22–0.32 | HOLD |
| 0.32–0.47 | `PRODUCTS.` enters from the left, passes behind, settles mid-right |
| 0.47–0.55 | HOLD |
| 0.55–0.68 | `STARTUPS.` enters from the left, settles low-right |
| 0.68–0.80 | The three words dim to 30%. The statement assembles word by word (each word: opacity + 6px rise, scrubbed): **"I build products for problems worth solving."** |
| 0.80–1.00 | HOLD. Index `01 02 03` (reference top-right) shows `03` active |

**Copy:** the three words and the statement (h2). These are verified positioning:
Computer Science student · Founder · product builder.

**Mobile:** words stack left-aligned in one column. The Core travels top-right →
bottom-left so it still crosses each word.

**Static:** all three words plus the statement in the reference composition, with the
Core between them.

---

### 03 · The Drop

**Purpose:** a deliberate transition. The Core changes register from *identity* to
*work*.

| p | Beat |
|---|---|
| 0.00–0.20 | Identity type exits downward/forward (scale 1→1.15, opacity → 0). Core moves to top-centre |
| 0.20–0.30 | A thin vertical light beam fades in above the Core (additive sprite, peak opacity 0.6) |
| 0.30–0.55 | The Core falls 40vh (gravity-shaped: `power2.in`), stretching vertically ≤ 6% at maximum velocity |
| 0.55 | Impact on an invisible surface |
| 0.55–0.85 | Ripple rings propagate across a tilted plane. **The ring phase is driven by `p`, not time**, so it reverses. Right column: `Ideas · People · Technology · Real impact` fades in, one label per 0.06 |
| 0.85–1.00 | The ripple light spreads. The background lifts from `--void` to the "stage" radial (charcoal with a 4% lavender falloff), which becomes Stayza's environment. Beam out |

**Safety:** brightness rises over ≥ 0.3 of the scene (≈ 45vh of scroll). Peak luminance
is capped so no frame is a flash (WCAG 2.3.1).

**film-lite:** the ripple surface is replaced by three CSS rings (scale + opacity,
transform-only). **Static:** the frame at p = 0.6, as a still render.

---

## ACT II: THE WORK · left → right

### 04 · Stayza

**Purpose:** introduce the flagship like a product launch, not a card.

| p | Beat |
|---|---|
| 0.00–0.30 | The laptop (SVG frame + real Stayza screenshot) **rises out of the ripple**: y +30vh → 0, rotateX 18° → 6°. The Core rises with it and settles in orbit at the laptop's upper-right corner (anchor `stayza-laptop-tr`) |
| 0.20–0.38 | `STAYZA` (Display XL) enters from the left, `back` layer |
| 0.34–0.44 | Tagline (Title): ✎ **"Find a hostel you can trust."** (replaces the reference's placeholder) |
| 0.42–0.52 | Description + `VIEW CASE STUDY →` (/projects/stayza) + `VISIT STAYZA.PK ↗` |
| 0.45–0.55 | Index list bottom-right: `01 IDEA · 02 PRODUCT · 03 IMPACT` |
| 0.55–0.80 | **HOLD** |
| 0.80–1.00 | The laptop scales 1 → 1.6 toward the viewer. `STAYZA` slides right *behind* the laptop (it's in `back`, the laptop is in `props`). Text column exits right |

**Copy:** project name, status `IN PRODUCTION`, role `FOUNDER & CEO`. Description:
"Verified, commission-free student housing across Pakistan. Built and run end to end."
Small stat line: `800+ COMMITS · LIVE AT STAYZA.PK`.

**Mobile:** the laptop sits in the top 45svh at 92vw wide; text goes below; the index
list is hidden (its content is still in the case study). The end-of-scene scale is
1 → 1.25.

**Static:** reference frame 04.

---

### 05 · Stayza, up close

**Purpose:** prove it's real. Show the actual product, detail by detail.

| p | Beat |
|---|---|
| 0.00–0.15 | "We fly into the UI": the screen scales until it fills the viewport; the laptop frame fades out at 0.10 |
| 0.15–0.25 | The UI decomposes into **≤ 5 depth layers** (CSS 3D, `translateZ`): search bar, map, listing card, verification badge, dashboard tile. Each is a real cropped screenshot |
| 0.25–0.85 | The Core travels **left → right** across the layers and stops at four details. At each stop: that layer brightens, the others drop to 50%, and a left-column label + one sentence appears. Stops ≈ 0.15 each, of which 0.08 is HOLD |
| 0.85–1.00 | Camera backs away: the layers recombine, frame returns, laptop shrinks to 0.4× at left-centre (hand-off to 06) |

**Four stops** (verified from the Stayza codebase and product doc):
1. `SEARCH`: map, filters, and AI search that understands Roman Urdu ("lrko hstl 15hzr tk")
2. `TRUST TIERS`: Address Checked → Video Verified → Inspected, plus CNIC-verified owners
3. `DIRECT CONTACT`: WhatsApp or call the owner. Zero commission, free for students
4. `OWNER DASHBOARD`: owners list rooms, photos and amenities; admins approve and moderate

**Assets:** 1 full-page desktop screenshot + 5 cropped layer images (search bar, map
with clusters, listing card with trust badges, contact buttons, owner dashboard tile),
all captured from stayza.pk at 2×. The map is real (Leaflet), so the reference's map idea
survives; its interior photos are replaced by real listing photos.

**Mobile:** no 3D decomposition. The screenshot pans (translateY) under a fixed phone-width
viewport while the Core marks each stop. Same four stops, stacked captions.

**Static:** four stacked rows, each a cropped real screenshot + label + sentence.

---

### 06 · Web → Mobile

**Purpose:** a single continuous shot from web to mobile. This is the transition
people should remember.

| p | Beat |
|---|---|
| 0.00–0.20 | The laptop (0.4×) loses its frame. Only the screen rectangle remains, as a 1px `--hairline-strong` outline with the screenshot inside fading out |
| 0.20–0.80 | The Core (`tracer`) runs the rectangle's perimeter, leaving a short light trail (SVG `stroke-dashoffset`, synced). At the same time the rectangle morphs: aspect 16:10 → 9:19.5, radius 10 → 48px, travelling left-centre → centre (still left → right). Pure SVG `rect` attribute interpolation, no shape-morph plugin |
| 0.80–1.00 | The phone frame materialises around the final shape. CampusFlow's splash screen fades in. A small label above the phone: `CAMPUSFLOW · BY STAYZA`. This is a true story beat: the same company goes from web to mobile |

**Mobile:** identical. It works naturally in portrait because the shape is
centre-stage and small.

**Static:** two frames side by side (outlined laptop rect → phone).

---

### 07 · CampusFlow (the light scene)

**Purpose:** a register change. Light, calm, everyday. Mobile product.

| p | Beat |
|---|---|
| 0.00–0.15 | **The screen floods out.** The phone's light UI expands as a paper layer (`clip-path: inset()` animated from the phone screen rect to the full viewport). The background is now `--paper`. Core blends `uDark` 0 → 1 (ink glass) and gets a contact shadow |
| 0.15–0.30 | The phone settles centre-right. `CAMPUSFLOW` (ink) enters from the left. Tagline ✎ **"Open. Glance. Know. Go."** Description: "Your timetable, answering one question: where do I go now? Offline-first, for Android." `VIEW CASE STUDY →` · `GET THE APK ↗` (stayza.pk/campusflow) |
| 0.30–0.75 | The phone rotates rotateY −10° → +10° across the whole range (never more than 12°). **Four screens** play inside it (each slides up within the screen, scrubbed), synced with the index list `01 NOW / NEXT · 02 LEAVE NOW · 03 EXCEPTIONS · 04 WIDGET` (the real features; the reference's assignments/announcements/community don't exist). Each screen is held for ~0.06 |
| 0.55–0.72 | "Widgets detach": on `04 WIDGET`, the **real home-screen widget** (next-class countdown) lifts out of the phone (translateX 6–10vw, translateZ, soft shadow), hangs beside it, then docks back. The reference's idea becomes literal. This is the scene's single "wow" |
| 0.75–0.85 | HOLD |
| 0.85–1.00 | Paper **contracts to a point at the Core** (`clip-path: circle()` shrinking around the Core's anchor). Void returns, `uDark` → 0. Direction hands over to depth (into Z) |

**Contrast:** all text is ink on paper (≥ 6.2:1). No light-on-paper text.

**Mobile:** the phone is centred at 62svh high; the title goes above it, the index list
is hidden, and the active feature name shows as a caption under the phone.

**Assets:** 5 real screens from the APK (NOW, leave-now, exception, import, the widget
on a home screen), light mode, native resolution.

**Static:** a paper section: phone + title + four features as a list.

---

## ACT III: DEPTH · into Z

### 08 · Madad

**Purpose:** change visual language from product to system. Madad is an **offline
semantic search engine**, not a chatbot, so the scene is about *finding*: data
structures, ranking, speed. No "AI magic" clichés.

| p | Beat |
|---|---|
| 0.00–0.15 | The Core moves toward the camera (1.0 → 2.2×). The ambient float stops |
| 0.15–0.50 | **The split:** 1 → 3 (0.20) → 20 (0.32) → N (0.45). Each node is born *from* its parent's position (hierarchical seeds), so it reads as division, not spawning. N = 2,400 (`film`) / 600 (`film-lite`). **The nodes are chunks of course material.** A Label-style counter ticks with the split: `39,000 CHUNKS · 11 COURSES` (the real corpus) |
| 0.40–0.60 | Nodes cluster by course (11 soft clusters) and settle into a 3D lattice: **the concept graph**. Edges (line segments, alpha by distance, ≤ 2× node count) fade in. Camera dollies slowly into the lattice |
| 0.30–0.45 | `MADAD` (Display XL) left, with a small `مدد · HELP` label. Tagline ✎ **"Help, found offline."** Description: "Search a whole semester of slides, PDFs and scans in milliseconds, with no internet." `VIEW CASE STUDY →` |
| 0.55–0.90 | **A query, live:** a query types into a minimal field (`"third normal form"`). The right column runs the real path: `QUERY → BM25 + SEMANTIC → HYBRID RANK → TOP RESULTS` with real budgets (`< 50 MS`, `< 100 MS`). In the lattice, matching nodes light up and the top-K pull forward toward the camera. Then a **Dijkstra learning-path** pulse travels the concept graph (Madad's real "learning paths" feature) |
| 0.90–1.00 | HOLD |

**Forbidden here:** matrix rain, green-on-black, glitch effects, chat bubbles, and "AI chatbot" / "RAG" as the headline (Madad's own README rules this out).

**Mobile:** the lattice is centred behind the text with the text on a scrim
(`--void` 70% gradient). The pipeline becomes a vertical list under the title.

**Static:** a still render of the lattice + pipeline list.

---

### 09 · Under the hood

**Purpose:** a clear architecture explanation, readable in about 5 seconds.

| p | Beat |
|---|---|
| 0.00–0.10 | The lattice recedes and becomes particle streams flowing along +Z |
| 0.10–0.75 | **Four glass panes** at increasing depth along a gentle curve, each a real DOM element (crisp text, CSS 3D), following the data's real path: `YOUR FILES · PDF, slides, Word, scans` → `PYTHON BRAIN · parse, OCR, chunk, embed, classify` → `THE CONTRACT · versioned files, CRC32-checked` → `C++ ENGINE · hash table, inverted index, KD-tree, LSH, HNSW, trie, heap, all from scratch`. Last pane footer: `11,221 ENGINE CHECKS · 369 BRAIN TESTS`. The camera travels *through* them. Each pane passes the viewer and fades as it nears, and particles stream through the panes between stages |
| 0.75–0.90 | **Converge:** every node flows back into one point. The Core is whole again, centred. ("We're still in the same story.") |
| 0.90–1.00 | HOLD. Stillness |

**Rule:** the panes say what each part *does*, not just its name. A small origin line
under the panes: "Built as my CS250 Data Structures + CS272 AI semester project." It's
honest, and it's impressive.

**Mobile:** the panes are a vertical sequence (each one centred, the next behind it),
same fly-through.

**Static:** the four panes in a row (desktop) or column (mobile) with arrows.

---

## ACT IV: THE PERSON · camera pulls back

### 10 · Behind the work

**Purpose:** after three technical scenes, slow down and introduce the person.

| p | Beat |
|---|---|
| 0.00–0.15 | **Stillness.** Everything clears. The Core slows to near-motionless. Nothing else |
| 0.15–0.40 | The portrait fades in full-bleed (right 60% on desktop, top 60svh on mobile) and scales 1.08 → 1.0 (pull-back). Black & white, editorial |
| 0.25–0.55 | The Core drifts *behind* the subject. The cut-out subject is in `front`, the background plate in `props`, the Core in between. Where it overlaps, the Core's glass samples the portrait texture, so it looks refracted |
| 0.35–0.65 | `BEHIND THE WORK` (label), then line by line: `A student.` / `A builder.` / `A problem solver.` |
| 0.55–0.70 | Right column (short bio from `profile.json`): Computer Science at NUST (SEECS). Founder & CEO of Stayza. Interested in backend systems and products people rely on. Based in Islamabad. `MORE ABOUT ME →` (/about) |
| 0.70–1.00 | HOLD |

**Hard requirement:** a **real photograph of Abdul**. The reference portrait is
AI-generated and must not be used. If no photo exists at build time, this scene ships
in its **typographic variant**: the same copy, with the Core and the three lines larger,
no image. It does not get a stock or generated portrait.

**Mobile:** the portrait is on top, the text below it on a scrim, and the Core crosses
behind the subject's shoulder.

---

### 11 · Timeline

**Purpose:** show momentum. Real dates only.

| p | Beat |
|---|---|
| 0.00–0.15 | Camera pulls back to reveal a dark horizon landscape (pre-rendered AVIF, desaturated). A hairline timeline crosses the frame |
| 0.15–0.90 | The track translates **right → left** (time flows toward the viewer's past) while the Core (`marker`) walks the line and pauses ~0.04 at each milestone, which brightens to `--fg` |
| 0.90–1.00 | The last node `NEXT → More to come` stays lit |

**Milestones (verified; project months from git history, CONTENT §4):**

| When | Milestone |
|---|---|
| 2023 | Matriculation |
| 2025 | FSc Pre-Engineering · starts writing code |
| Sep 2025 | Joins BS Computer Science, SEECS, NUST |
| Apr 2026 | Founds Stayza (now in production) |
| May 2026 | Raabta AI, Google Antigravity National Hackathon |
| Jul 2026 | Madad · Web Development Intern, MarketBrainsCo |
| Aug 2026 | LimitTrack released |
| Sep 2026 | CampusFlow v1.0 for Android, by Stayza |
| Next | More to come |

The reference's "2022 Started CS at NUST / 2024 Founded Stayza" is **wrong** and must
not ship.

**Data:** the existing derived timeline (`features/timeline/lib/build-timeline.ts`),
filtered to the film's milestones. It isn't hand-written in the scene.

**Mobile:** a vertical timeline. The Core walks down the line. No horizontal track.

---

### 12 · Toolkit (added 2026-10-02)

**Purpose:** show what he builds with, honestly. Only technologies that appear in a
project's `techStack`, each chip saying which projects use it ("Supabase · Stayza ·
CampusFlow"). Computed from `projects.json` + `skills.json` categories.

| p | Beat |
|---|---|
| 0.00–0.16 | `What I build with` label, **Toolkit.** rises, then "24 technologies across 9 projects. Only what my projects actually use." |
| 0.12–0.30 | Three rows (Languages · Interfaces & mobile · Backend & data) enter from the right, chip by chip |
| 0.30–0.90 | **Rows drift in opposite directions** with the scroll (left, right, left), revealing every chip that overflows (on phones that's most of them). The Core runs behind the rows, left to right |
| 0.50, 0.86 | Stops |
| 0.92–1.00 | Rows recede |

Icons are monochrome. The brand colour appears only on hover. Static mode: wrapped rows.

---

## ACT V: CONVERGE · toward the centre

### 12 · Experiments

**Purpose:** breadth. Everything else he's built, in one row.

| p | Beat |
|---|---|
| 0.00–0.20 | `EXPERIMENTS` + "Prototypes, hackathon builds and side projects." enter from the left |
| 0.15–0.50 | Cards drift in from the right edge toward centre with a 0.05 stagger and settle in a row. The Core (`satellite`) rests at left |
| 0.50–1.00 | HOLD |

**Cards are data-driven**: projects with `film: "experiment"` in `projects.json`,
proposed: Raabta AI, LimitTrack, Smart Academic File Organizer, SnapType, JARVIS OS,
TypoBuddy (max 6; SmartGo and Crime Management System stay in `/projects`). Each card: name, one-line summary, status, link to `/projects/<slug>`. The
reference's "AI Study Buddy / UniLens / VisionOS Concept / Small Tools" are
placeholders and don't exist.

**Card visual:** a real screenshot if one exists. Otherwise a generated typographic
cover (project initial + Core light), never a fake UI.

**Mobile:** a native horizontal scroll-snap row (no scroll hijack). The film's vertical
scroll doesn't drive it. A `1 / 6` counter sits below.

---

### 13 · Let's build

**Purpose:** the ending. One invitation.

| p | Beat |
|---|---|
| 0.00–0.30 | Everything we've seen (Stayza, CampusFlow, Madad, the portrait, the experiments) appears as small thumbnails that **drift backward into depth** (scale → 0.2, opacity → 0.25) and converge toward the centre |
| 0.25–0.55 | The headline sets line by line: `LET'S BUILD` / `SOMETHING` / `WORTHWHILE` |
| 0.45–0.65 | **The Core lands on the period.** It travels to the anchor span after `WORTHWHILE` and scales to the type's period size. The real `.` stays in the DOM (for screen readers and copy-paste) and is visually transparent |
| 0.60–0.75 | `LET'S TALK →` (pill, → `/contact`), then Email · GitHub · LinkedIn icons, then `RÉSUMÉ ↓` |
| 0.75–1.00 | HOLD |

**Copy:** h2 "Let's build something worthwhile." Socials from `socials.json` only (the
reference's X icon is dropped unless an X account is added).

---

### 14 · Outro → Credits

**Purpose:** close the loop. Light in the void, then normal page.

| p | Beat |
|---|---|
| 0.00–0.50 | Camera tilts up. A planet's limb arcs across the lower third (a pre-rendered AVIF arc with a thin atmospheric rim). The Core shrinks (`horizon`) and descends to rest on the horizon as a single point of light, mirroring frame one |
| 0.40–0.70 | `SAME CURIOSITY. BIGGER PROBLEMS.` (Label, centred) |
| 0.70–1.00 | HOLD → the stage unpins |

**Credits** (normal flow, after the film): the full site footer, laid out like
end credits. Name, role line, then columns: `WORK` (projects), `WRITING`, `ABOUT`
(about, experience, education, skills, timeline), `MORE` (uses, now, achievements,
changelog, résumé), socials, colophon ("Built with TanStack Start, three.js and GSAP.
Set in Archivo and Inter."), Motion toggle, ©. Once the canvas is fully out of view,
rendering pauses.

---

## Cross-scene continuity checklist

- [ ] Laptop: 04 end transform === 05 start; 05 end === 06 start (props layer, one element)
- [ ] Phone: 06 end === 07 start (props layer, one element)
- [ ] Core: every boundary is continuous in position, scale and material (one global Core track)
- [ ] Background: void → stage-radial (03) → stage (04–06) → paper (07) → void (07 end) → … → horizon (14)
- [ ] Every scene's `back`/`front` layers are empty at p = 1.0 (clean hand-off, Engineering §4)
