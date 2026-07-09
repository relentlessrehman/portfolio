# Content Guide — how to add anything

Everything on the site is driven by data in `src/content/data/*.json` (with a
thin `.ts` wrapper per file so imports stay stable). You never touch
components or routes to add content.

## The easy way: Studio

Run `npm run dev`, then open **http://localhost:3000/studio**. It's a local,
social-media-style editor: every content type is a "feed" you can browse, and
a form with real fields for adding or editing an entry. Saving validates
against the same Zod schemas the build uses, then writes straight to the JSON
file — the page updates instantly. Studio only runs in development; it does
nothing (and ships nothing) in production.

## The manual way

Edit the JSON file directly (or the VS Code snippets below), then run:

```
npm run verify
```

It regenerates routes, typechecks, runs tests, and builds. If your content has
a mistake (bad date, missing field), the build fails and tells you exactly
which field in which file.

## Cheatsheet

| I want to add…        | Do this                                                                  |
|-----------------------|--------------------------------------------------------------------------|
| A blog post           | `npm run new:post -- "My title"` → edit the created `.mdx`, set `draft: false` (or use Studio → Writing) |
| A project             | Studio → Projects → + New, or `npm run new:project -- "Name"` and paste into `src/content/data/projects.json` |
| Experience            | Studio → Experience, or `src/content/data/experience.json` (VS Code snippet: `pf-experience`) |
| An achievement        | Studio → Achievements, or `src/content/data/achievements.json` (snippet: `pf-achievement`) |
| A certification       | Studio → Certifications, or `src/content/data/certifications.json` (snippet: `pf-certification`) — page & footer link appear automatically |
| Education             | Studio → Education, or `src/content/data/education.json`                |
| A skill               | Studio → Skills, or `src/content/data/skills.json` — spelling must match project `techStack` names |
| A timeline-only event | Studio → Milestones, or `src/content/data/milestones.json` (snippet: `pf-milestone`) |
| A changelog entry     | Studio → Changelog, or `src/content/data/changelog.json` (snippet: `pf-changelog`) |
| An open-source contribution | Studio → Open Source, or `src/content/data/open-source.json` — hidden from nav until filled |
| A book / reading note  | Studio → Reading, or `src/content/data/reading.json` — hidden from nav until filled |
| A talk / event         | Studio → Speaking, or `src/content/data/speaking.json` — hidden from nav until filled |
| My resume PDF          | Drop the file at `public/resume/<name>.pdf`, then add a version via Studio → Resume, or `src/content/data/resume.json` |
| Update "Now"          | Studio → Now, or edit `currentFocus` in `profile.json` and bump `updatedAt` in `now.json` |
| Tools I use           | Studio → Uses, or `src/content/data/uses.json`                          |
| A social link         | Studio → Socials, or `src/content/data/socials.json`                    |
| My portrait           | Drop image at `public/images/portrait.jpg`, then add `portrait` in Studio → Profile (or `profile.json`) |

## What updates automatically

Adding **one project object** updates: projects grid, home featured section,
technology filters, related projects, skill evidence ("Used in X"), the
timeline, quick stats, sitemap/SEO. Adding **one MDX file** updates: writing
index, home "Latest writing", tags, RSS, reading time.

The timeline is 100% derived — never add education/projects/experience to
`milestones.ts`, they appear on the timeline by themselves.

## Rules the build enforces

- Dates are `'YYYY'`, `'YYYY-MM'`, or `'YYYY-MM-DD'` (quoted strings).
- Project `slug` is kebab-case and unique.
- `techStack` names must match `skills.ts` spellings exactly (that's how
  evidence and search-by-technology join).
- `relatedSlugs` (optional) must point at real project slugs.
- Post frontmatter needs `title`, `description`, `publishedAt`.

## Growing a project into a full case study

Start with `overview` + `problem`. Add sections over time — each renders (and
joins the table of contents) the moment it exists:

`research · planning · architecture · database · implementation · challenges
(structured cards) · tradeoffs (comparison cards) · lessons (insight cards) ·
futureImprovements (roadmap cards)`

Structured templates for challenges/tradeoffs/roadmap are in the comment at
the top of `projects.ts`. Add `stages` for the lifecycle timeline, and
`engineering: { commits, pages, apiRoutes, databaseTables, … }` for the
metrics panel — anything present renders automatically.
