#!/usr/bin/env node
/**
 * Print a ready-to-paste project object:
 *   npm run new:project -- "Project Name"
 *
 * Paste the output into the array in src/content/data/projects.json
 * (or use the Studio at /studio → Projects → + New instead).
 * Everything else (grid, filters, search, timeline, sitemap, SEO)
 * updates automatically.
 */
const name = process.argv.slice(2).join(' ').trim()
if (!name) {
  console.error('Usage: npm run new:project -- "Project Name"')
  process.exit(1)
}

const slug = name
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
const yearMonth = new Date().toISOString().slice(0, 7)

const template = {
  slug,
  name,
  tagline: 'TODO one line under the name',
  summary: 'TODO 2-3 sentences for cards and meta descriptions.',
  status: 'building', // idea | planning | building | testing | production | maintained | archived
  featured: false, // true shows it on the home page
  role: 'TODO your role',
  timeline: { start: yearMonth },
  techStack: ['React', 'TypeScript'], // must match names in src/content/data/skills.json
  links: {},
  caseStudy: {
    overview: ['TODO what it is and what you own.'],
    problem: ['TODO the problem it solves.'],
  },
  gallery: [],
}

console.log(`
Paste this into the array in src/content/data/projects.json:

${JSON.stringify(template, null, 2)
  .split('\n')
  .map((line) => `  ${line}`)
  .join('\n')},

Then run: npm run verify
`)
