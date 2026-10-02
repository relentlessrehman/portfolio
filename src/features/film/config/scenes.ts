/*
 * The film's scene registry — the single source of truth for order, acts,
 * scroll lengths and stops (docs/redesign/STORYBOARD.md). Lengths are how far
 * the user scrolls while a scene is pinned, in viewport heights; they become
 * CSS variables, so tuning pacing never touches choreography code.
 */

export type ActId = 'arrival' | 'work' | 'depth' | 'person' | 'converge'

export interface SceneConfig {
  /** DOM id and hash target, e.g. /#stayza */
  id: string
  /** Display index, "01"… */
  index: string
  /** Short scene name for the chapter rail and corner labels */
  name: string
  act: ActId
  /** Pinned scroll length in vh — desktop/tablet and phone portrait */
  length: { d: number; m: number }
  /**
   * Local progress values of the scene's HOLD frames. Directed scrolling stops
   * here (engine/scroll-control.ts); the first one is where chapter jumps land.
   */
  stops: Array<number>
}

export const ACTS: Array<{ id: ActId; label: string }> = [
  { id: 'arrival', label: 'Arrival' },
  { id: 'work', label: 'The work' },
  { id: 'depth', label: 'Depth' },
  { id: 'person', label: 'The person' },
  { id: 'converge', label: 'Ending' },
]

/* Timeline stops: one per milestone (choreography steps 0.15 + k * 0.74/8) */
const MILESTONE_STOPS = Array.from({ length: 9 }, (_, k) =>
  Number((0.15 + k * (0.74 / 8)).toFixed(4)),
)

export const SCENES: Array<SceneConfig> = [
  {
    id: 'intro',
    index: '01',
    name: 'Intro',
    act: 'arrival',
    length: { d: 150, m: 110 },
    stops: [0],
  },
  {
    id: 'identity',
    index: '02',
    name: 'Identity',
    act: 'arrival',
    length: { d: 300, m: 220 },
    stops: [0.25, 0.5, 0.72, 0.86],
  },
  {
    id: 'drop',
    index: '03',
    name: 'Transition',
    act: 'arrival',
    length: { d: 150, m: 120 },
    stops: [0.82],
  },
  {
    id: 'stayza',
    index: '04',
    name: 'Stayza',
    act: 'work',
    length: { d: 200, m: 160 },
    stops: [0.62],
  },
  {
    id: 'stayza-detail',
    index: '05',
    name: 'Stayza details',
    act: 'work',
    length: { d: 250, m: 200 },
    stops: [0.27, 0.44, 0.61, 0.78],
  },
  {
    id: 'to-mobile',
    index: '06',
    name: 'Web to mobile',
    act: 'work',
    length: { d: 150, m: 120 },
    stops: [0.94],
  },
  {
    id: 'campusflow',
    index: '07',
    name: 'CampusFlow',
    act: 'work',
    length: { d: 250, m: 200 },
    stops: [0.3, 0.38, 0.53, 0.68],
  },
  {
    id: 'madad',
    index: '08',
    name: 'Madad',
    act: 'depth',
    length: { d: 200, m: 160 },
    stops: [0.48, 0.9],
  },
  {
    id: 'under-the-hood',
    index: '09',
    name: 'Under the hood',
    act: 'depth',
    length: { d: 200, m: 160 },
    stops: [0.18, 0.34, 0.49, 0.65, 0.9],
  },
  {
    id: 'about',
    index: '10',
    name: 'About',
    act: 'person',
    length: { d: 200, m: 160 },
    stops: [0.72],
  },
  {
    id: 'timeline',
    index: '11',
    name: 'Timeline',
    act: 'person',
    length: { d: 220, m: 200 },
    stops: MILESTONE_STOPS,
  },
  {
    id: 'toolkit',
    index: '12',
    name: 'Toolkit',
    act: 'person',
    length: { d: 200, m: 180 },
    stops: [0.5, 0.86],
  },
  {
    id: 'experiments',
    index: '13',
    name: 'More work',
    act: 'converge',
    length: { d: 150, m: 150 },
    stops: [0.55],
  },
  {
    id: 'contact',
    index: '14',
    name: "Let's build",
    act: 'converge',
    length: { d: 150, m: 120 },
    stops: [0.78],
  },
  {
    id: 'outro',
    index: '15',
    name: 'Outro',
    act: 'converge',
    length: { d: 100, m: 100 },
    stops: [0.9],
  },
]

export const sceneIndexById = new Map(
  SCENES.map((scene, index) => [scene.id, index]),
)

/** Index of a scene by id — throws on a typo so choreography can't silently drift */
export function sceneIndex(id: string): number {
  const index = sceneIndexById.get(id)
  if (index === undefined) throw new Error(`Unknown scene "${id}"`)
  return index
}

/** Where chapter jumps land: the scene's first stop */
export function holdOf(scene: SceneConfig): number {
  return scene.stops[0] ?? 0
}

/** First scene of each act — chapter rail targets */
export const ACT_STARTS = ACTS.map((act) => ({
  ...act,
  sceneId: SCENES.find((scene) => scene.act === act.id)?.id ?? 'intro',
}))
