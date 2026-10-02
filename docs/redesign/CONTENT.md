# Content: what's true, what's missing, what Abdul needs to provide

Design principle #1 is *truth over spectacle*. The reference image was generated to show
a **look**, and several of its facts are wrong or invented. This file is the source of
truth for what the film may say.

**Sources (verified 2026-10-02):** `src/content/data/*.json`, plus the project repos in
`E:\Startups\` (READMEs, PRDs, `package.json`, git history). Dates marked *(git)* are
the first-commit dates of the repo, used as start dates unless Abdul corrects them.

## 1. Corrections to the reference image

| Reference shows | Reality | Action |
|---|---|---|
| Timeline "2022 Started CS at NUST" | Joined BS CS, SEECS NUST **Sep 2025** | Use real date |
| "2023 Built my first real product" | Started coding **2025** | Remove |
| "2024 Founded Stayza" | Stayza founded **Apr 2026** | Use real date |
| "2025 CampusFlow & Madad" | Madad **Jul 2026**, CampusFlow **Sep 2026** *(git / PRD)* | Use real dates |
| Madad = "AI-powered RAG system… answers using your own data" | Madad is an **offline semantic study search engine**. Its README states outright: *"It is not an AI chatbot."* The LLM Ask Mode is an optional demo layer | **Rewrite scenes 08–09** around search & data structures (§3.3) |
| Madad pipeline "Query → Retrieval → Reranking → Generate → Answer" | Real: Python **Brain** (ingest → parse/OCR → chunk → embed → classify) → versioned file contract → C++ **Engine** (indexes built from scratch) → hybrid search → rank | Use the real pipeline |
| CampusFlow = "university companion: timetables, assignments, announcements, community" | CampusFlow is a **time-aware schedule assistant**: NOW/NEXT countdowns, "leave now", exceptions, widget. No assignments/announcements/community features | Use real features (§3.2) |
| Stayza "Find your next place" / interiors / map mock | Real positioning: **verified, commission-free student hostels**, direct owner contact. The map is real (Leaflet) | Real copy + real screenshots |
| Portrait | **AI-generated, not Abdul** | Real photo, or the typographic variant |
| Experiments: AI Study Buddy, UniLens, VisionOS Concept, Small Tools | **Don't exist** | Real projects (§3.4) |
| "A builder from Islamabad" | From Samundri; **based in** Islamabad | "A builder based in Islamabad" |
| X / Twitter icon | No X account | Drop |

## 2. Verified facts: identity

- **Name:** Abdul Rehman · **Positioning:** Software Engineer · Product Builder · Founder
- **Education:** BS Computer Science, SEECS, NUST, Sep 2025 → 2029 (expected). FSc
  Pre-Engineering, Punjab College (2023–2025). Matriculation (2023).
- **Experience:** Founder & CEO, Stayza (Apr 2026 →). Web Development Intern,
  MarketBrainsCo (Jul 2026 →).
- **Achievements:** Top 55, PIEAS National Science Talent Contest · Winner, STEM
  Competition, UAF · Quaid-e-Azam Scout · Punjab Boy Scout · Google Antigravity
  National Hackathon participant (Raabta AI).
- **Contact:** relentlessrehman@gmail.com · GitHub **rehmanoncloud9** (confirmed) ·
  LinkedIn arehman-builds
- **Domain:** **https://iamabdulrehman.vercel.app** (confirmed; set in `seo.json`)

## 3. Verified facts: hero projects

### 3.1 Stayza (scenes 04–05)

- **What:** a trusted student-accommodation marketplace for Pakistan. Verified,
  commission-free hostels, shared apartments and rooms in Islamabad, Lahore and
  beyond, with direct owner contact. *Deliberately not a booking platform* (founder
  decision in `PRODUCT_DIRECTION.md`).
- **Status:** in production at https://www.stayza.pk · **800+ commits** · actively
  shipped (latest commit 2026-10-02: Roman-Urdu SMS-style search).
- **Role:** Founder & CEO: product, engineering, hiring, QA, business development.
- **Real feature set** (from routes + product doc):
  - **Search:** filters, map search (Leaflet + clustering), AI search that understands
    Roman Urdu / SMS-style queries ("lrko hstl 15hzr tk")
  - **Trust tiers:** Address Checked → Video Verified (live call) → Inspected
    (physical inspection) badges; owner CNIC verification with admin approval
  - **Direct contact:** WhatsApp / call the owner, zero commission, free for students;
    lightweight lead tracking
  - **Owner dashboard:** list and edit hostels, rooms, photos, amenities; subscription
    plans and listing boosts
  - **Admin:** CNIC approvals, payment verification, moderation, analytics, blog/SEO,
    careers portal
- **Stack:** TanStack Start, React, TypeScript, Tailwind, Supabase (Postgres, Auth),
  TanStack Query, Leaflet, Resend, Vercel. *(The portfolio's `experience.json` stack
  should add TanStack Start and Leaflet.)*
- **Film tagline (proposed):** **"Find a hostel you can trust."** One-liner: *Verified,
  commission-free student housing across Pakistan.*
- **Brand assets available:** `E:\Startups\Stayza\Stayza\Stayza-Brand-Pack` (wordmark,
  icon, social) and `E:\Startups\Stayza\Content` (carousels, reel assets).

### 3.2 CampusFlow (scenes 06–07)

- **What:** an intelligent, time-aware university schedule assistant. It turns a
  static timetable into one answer: *"What am I supposed to do right now, and where do I
  go next?"* Core interaction: **Open → Glance → Know → Go.**
- **Platform:** Android (v0 scope; iOS deferred). Expo SDK 57 / React Native,
  TypeScript, Zustand, SQLite (offline-first), Supabase sync, native Android home-screen
  widget.
- **Status:** v1.0.0, direct APK distribution via **"CampusFlow by Stayza"**
  (stayza.pk/campusflow). Started Sep 2026 *(git)*, 37 commits, **17 test suites /
  156 tests passing**. Built from Abdul's own PRD v2.2 + TRD v1.1.
- **Real features (scene 07 index list):**
  1. `NOW / NEXT`: live countdown to the current and next class, derived from the clock
  2. `LEAVE NOW`: walk-time-aware room-to-room transitions
  3. `EXCEPTIONS`: room changes, makeups, holidays, special timings (e.g. Friday)
  4. `WIDGET`: next-class countdown on the Android home screen
  - also: LLM-assisted timetable import, exam countdowns, conflict detection, offline
- **Film tagline:** **"Open. Glance. Know. Go."** One-liner: *Your timetable, answering
  "where do I go now?"*
- **Design note:** CampusFlow's own design system is "Liquid Minimalism", set in Plus
  Jakarta Sans. Screenshots should be of the real app in light mode, which fits the
  paper scene.
- **The Stayza connection** is a real story beat: CampusFlow ships *under* Stayza. The
  scene 06 web→mobile morph is literally one company going from web to mobile.

### 3.3 Madad (scenes 08–09)

- **What:** *Madad* (مدد, "help") is an **offline, local-first semantic search engine
  for university course material**. Point it at a semester of PDFs, slides, Word files
  and scanned images, and it indexes everything and answers queries in milliseconds.
  No cloud, no accounts.
- **Positioning rule (from its own README):** the headline is the search and retrieval
  system. **Never call it an "AI chatbot" or "RAG assistant".** Ask Mode (a local LLM via
  Ollama) is an optional demo layer.
- **Architecture: two halves, one frozen contract:**
  - **Brain (Python):** ingestion → parsing → OCR → cleaning → chunking → TF-IDF +
    embeddings → topic classifiers (LogReg / SVM / Random Forest / MLP) → evaluation
    suite. Plus a study loop: FSRS spaced repetition, Elo adaptive practice, weakness
    tracking.
  - **Contract:** versioned, CRC32-checksummed files (`chunks.jsonl`, `embeddings.bin`,
    `concept_graph.json`, …) + a JSON protocol. The Brain never searches; the Engine
    never embeds.
  - **Engine (C++14, all data structures from scratch):** hash table (FNV-1a, chaining),
    inverted index + BM25, KD-tree, LSH and HNSW for vectors, trie autocomplete, AVL
    tree, binary heap top-K, and a concept graph with BFS/DFS/Dijkstra learning paths.
- **Real numbers (README, 2026-07-18):** **~39,000 chunks** across **11 courses** ·
  **11,221** engine self-checks + **369** brain tests passing · budgets: keyword search
  < 50 ms, semantic < 100 ms (10k chunks), autocomplete < 10 ms.
- **Origin (honest framing):** built as the joint semester project for CS250 (Data
  Structures, the Engine) and CS272 (AI, the Brain). PRD v2.0 dated Jul 10, 2026.
- **Film tagline:** **"Help, found offline."** One-liner: *Search a whole semester of
  course material in milliseconds, with no internet.*
- **Visual truth for the swarm:** the nodes *are* chunks. The lattice *is* the concept
  graph, and the travelling pulse *is* a Dijkstra learning path. The metaphor is the
  literal system.

### 3.4 More work + `/projects`, decided through a recruiter lens (2026-10-02)

| Project | Film role | Why |
|---|---|---|
| Raabta AI | More work row | National hackathon, agentic, multilingual |
| Smart Academic File Organizer (= `course-files-organizer`, v2.0) | More work row | Classification engine + full-text search; fits the "built for students" story |
| Crime Management System | More work row | Java/JavaFX/Hibernate: desktop and database range |
| JARVIS OS, SmartGo | `/projects` only | Weaker or generic signal |
| SnapType | `/projects` only | Harmless, low signal |
| **LimitTrack** | **excluded** | Rotating accounts to dodge AI usage limits reads as ToS-dodging and "vibe coding" |
| **TypoBuddy** | **excluded** | A global keyboard hook that impersonates someone's typing: security/impersonation red flags |
| Studo | excluded | Its README credits AI as the author; overlaps the File Organizer |

The story the film tells: **he builds for students.** Housing (Stayza), the daily schedule
(CampusFlow), exam prep (Madad), course files (Organizer).

**Owner action:** stayza.pk's only public listing is "QA Test Boys Hostel" (featured on
home and search). Remove or hide it before the portfolio links there prominently.

## 4. Timeline (scene 11), real dates

| When | Milestone |
|---|---|
| 2023 | Matriculation |
| 2025 | FSc Pre-Engineering · starts writing code |
| Sep 2025 | BS Computer Science, SEECS, NUST |
| Apr 2026 | Founds **Stayza** |
| May 2026 | **Raabta AI**, Google Antigravity National Hackathon |
| Jul 2026 | **Madad** (CS250 + CS272) · Web Development Intern, MarketBrainsCo |
| Aug 2026 | **LimitTrack** released |
| Sep 2026 | **CampusFlow** v1.0 for Android, by Stayza |
| Next | More to come |

## 5. Content work for Phase 0

**Add to `projects.json`** (via Studio): CampusFlow, Madad, LimitTrack, SnapType,
TypoBuddy, and reconcile the File Organizer with `course-files-organizer`. Add
`film: hero` to Stayza, CampusFlow and Madad. Update Stayza's stack.

## 6. Asset list

| # | Asset | Where it comes from | Blocking? |
|---|---|---|---|
| A1 | **Portrait** | ✅ provided (`assets-src/film/portrait.png`), used in black & white | Done |
| A2 | **Stayza screenshots** | ✅ captured from stayza.pk at 2× (`scripts/capture-stayza.mjs`): home, search, compare, mobile | Done |
| A3 | **CampusFlow screens** | ✅ provided: NOW, day view, LLM import (`assets-src/film/campusflow-*.jpeg`) | Done |
| A4 | **Madad visuals** | Not needed: the scene renders the real system abstractly. Optional: GUI screenshot from `gui/app.py` for the case study | No |
| A5 | Experiment covers | Repo assets (`limittrack/icon.png`, Raabta `assets/`), or typographic covers | No |
| A6 | Stayza brand marks | `Stayza-Brand-Pack` | No |
| A7 | Résumé PDF (current) | Abdul (`public/resume` exists, check it's current) | No |

**Never acceptable:** AI-generated portraits, stock photos as him, mock UIs presented as
real products, invented metrics.

## 7. Remaining open questions for Abdul

1. **Portrait:** do you have a real photo you like, or should we plan a quick shoot
   (phone portrait mode, dark wall, window light)?
2. **CampusFlow screenshots:** can you screenshot 5 screens from the APK on your phone?
3. **Taglines:** approve or change: Stayza "Find a hostel you can trust." · CampusFlow
   "Open. Glance. Know. Go." · Madad "Help, found offline." · film statement "I build
   products for problems worth solving." · outro "Same curiosity. Bigger problems."
4. **Dates:** the git first-commit dates above (Raabta May, Study Organizer Jun, Madad
   Jul, LimitTrack Aug, CampusFlow Sep 2026). Are they right?
5. Is "Smart Academic File Organizer" the same project as "Course Files Organizer"?
6. Your phone model (for the real-device test log).
