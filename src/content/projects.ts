/*
 * Adding a project = adding one object here (or via `npm run dev` → /studio).
 * It automatically appears in the projects grid, home featured section (if
 * flagged), search, timeline, skill evidence, related projects, technology
 * filters, SEO, and the sitemap. Case-study sections can be added over time —
 * the detail page renders only what exists. Edit data/projects.json directly,
 * or use the Studio's structured fields + "Advanced JSON" section for the
 * deeper case-study structures (stages, tradeoffs, challenges, roadmap, …).
 */
import projectsData from './data/projects.json'
import type { ProjectInput } from './schemas/project'

export const projects = projectsData as Array<ProjectInput>
