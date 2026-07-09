#!/usr/bin/env node
/**
 * Scaffold a new writing post:
 *   npm run new:post -- "My post title"
 *
 * Creates src/content/writing/<slug>.mdx with today's date, as a draft.
 * Set `draft: false` when it's ready to publish.
 */
import fs from 'node:fs'
import path from 'node:path'

const title = process.argv.slice(2).join(' ').trim()
if (!title) {
  console.error('Usage: npm run new:post -- "My post title"')
  process.exit(1)
}

const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
const date = new Date().toISOString().slice(0, 10)
const file = path.join('src', 'content', 'writing', `${slug}.mdx`)

if (fs.existsSync(file)) {
  console.error(`Already exists: ${file}`)
  process.exit(1)
}

fs.writeFileSync(
  file,
  `---
title: ${title}
description: TODO — one or two sentences, shows in cards, meta tags, and RSS.
publishedAt: '${date}'
tags:
  - engineering
draft: true
---

Write here. Markdown, GFM tables, and fenced code blocks all work —
code is syntax-highlighted at build time.

## First section

Headings become the table of contents automatically.
`,
  'utf8',
)

console.log(`Created ${file}`)
console.log('Next: write the post, set draft: false, then run: npm run verify')
