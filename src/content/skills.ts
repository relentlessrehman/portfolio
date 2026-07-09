/*
 * Skill names must match project techStack spellings — evidence
 * ("N projects use this") is derived by exact name match.
 * Edit via `npm run dev` → /studio, or edit data/skills.json directly.
 */
import skillsData from './data/skills.json'

export const skills = skillsData.skills

/** Topics under active study — rendered as "Currently learning", never as claimed skills */
export const learningTopics = skillsData.learningTopics
