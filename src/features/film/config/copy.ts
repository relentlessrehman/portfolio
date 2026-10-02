/*
 * Words the film says that aren't project data. Every fact here is verified
 * (docs/redesign/CONTENT.md); project names, summaries and links come from the
 * content registry so the case studies and the film can't drift apart.
 */

export const IDENTITY_WORDS = [
  'Computer science.',
  'Products.',
  'Startups.',
] as const
export const IDENTITY_STATEMENT = 'I build products for problems worth solving.'

export const DROP_TAGS = [
  'Ideas',
  'People',
  'Technology',
  'Real impact',
] as const

export const STAYZA = {
  meta: 'Founder & CEO · In production',
  tagline: 'Find a hostel you can trust.',
  stat: '800+ commits · Live at stayza.pk',
  index: ['Idea', 'Product', 'Impact'],
  stops: [
    {
      label: 'Search',
      title: 'Search the way students look.',
      body: 'City, area, budget, and the university you need to be near.',
    },
    {
      label: 'AI search',
      title: 'Roman Urdu, understood.',
      body: 'Type “lrkiyon ka hostel nust k paas” and it still finds what you mean.',
    },
    {
      label: 'Trust',
      title: 'Three levels of verified.',
      body: 'Address Checked, Video Verified, Inspected. Owners verify their CNIC before they can list.',
    },
    {
      label: 'Compare',
      title: 'Compare, then call the owner.',
      body: 'Line up to three stays side by side, then contact the owner directly. Zero commission.',
    },
  ],
} as const

export const TRUST_TIERS = [
  { name: 'Address Checked', detail: 'Identity and address reviewed' },
  { name: 'Video Verified', detail: 'Live video walkthrough' },
  { name: 'Inspected', detail: 'Physical inspection' },
] as const

export const CAMPUSFLOW = {
  meta: 'Android beta · v1.0 · by Stayza',
  tagline: 'Open. Glance. Know. Go.',
  body: 'Your timetable, answering one question: where do I go now? Offline-first, for Android.',
  apk: 'https://www.stayza.pk/campusflow',
  features: ['Now / Next', 'Your day', 'Import with any LLM'],
} as const

export const MADAD = {
  native: 'مدد',
  meta: 'Offline search engine · C++ + Python',
  tagline: 'Help, found offline.',
  body: 'Search a whole semester of slides, PDFs and scans in milliseconds, with no internet.',
  counter: '~39,000 chunks · 11 courses',
  query: 'third normal form',
  pipeline: [
    { step: 'Query', note: 'tokenised in C++' },
    { step: 'BM25 + semantic', note: '< 50 ms · < 100 ms' },
    { step: 'Hybrid rank', note: 'fused, re-ranked' },
    { step: 'Top results', note: 'with the exact slide' },
  ],
  panes: [
    {
      title: 'Your files',
      body: 'PDFs, slides, Word documents, scanned handouts.',
    },
    {
      title: 'Python Brain',
      body: 'Parses, OCRs, chunks, embeds and classifies. Never searches.',
    },
    {
      title: 'The contract',
      body: 'Versioned, CRC32-checked files. The only thing both halves share.',
    },
    {
      title: 'C++ Engine',
      body: 'Hash table, inverted index + BM25, KD-tree, LSH, HNSW, trie, heap. All from scratch. Never embeds.',
    },
  ],
  tests: '11,221 engine checks · 369 brain tests',
  origin: 'Built as my CS250 Data Structures + CS272 AI semester project.',
} as const

export const ABOUT_LINES = [
  'A student.',
  'A builder.',
  'A problem solver.',
] as const

/* Verified milestones — education.json, experience.json, achievements.json and
   first-commit dates of the project repos (CONTENT.md §4) */
export const MILESTONES = [
  { when: '2023', what: 'Matriculation' },
  { when: '2025', what: 'FSc Pre-Engineering. Starts writing code' },
  { when: 'Sep 2025', what: 'BS Computer Science, SEECS, NUST' },
  { when: 'Apr 2026', what: 'Founds Stayza' },
  {
    when: 'May 2026',
    what: 'Raabta AI at the Google Antigravity National Hackathon',
  },
  { when: 'Jun 2026', what: 'Smart Academic File Organizer' },
  { when: 'Jul 2026', what: 'Madad. Web Development Intern at MarketBrainsCo' },
  { when: 'Sep 2026', what: 'CampusFlow, Android beta' },
  { when: 'Next', what: 'More to come' },
] as const

export const CONTACT_LINES = ["Let's build", 'something', 'worthwhile'] as const
export const OUTRO = 'Same curiosity. Bigger problems.'
