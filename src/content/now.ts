/*
 * /now derives its list from profile.currentFocus and the featured
 * project — update those in profile.ts / projects.ts. This module only
 * carries the "last updated" date (bump it when focus changes) and an
 * optional personal note. Edit via `npm run dev` → /studio, or edit
 * data/now.json directly.
 */
import nowData from './data/now.json'

export const now = nowData
