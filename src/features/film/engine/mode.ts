/*
 * Presentation mode (Design §11, Engineering §3):
 *   film       full film — WebGL Core, scrubbed choreography
 *   film-lite  same choreography, lighter rendering (low-tier devices, Save-Data)
 *   static     the editorial page — no JS, reduced motion, Motion off, no WebGL2
 *
 * MODE_SCRIPT runs inline in <head> before first paint so the layout never
 * changes after load. resolveFilmMode() is the same decision at runtime and may
 * only ever downgrade.
 */

export type FilmMode = 'film' | 'film-lite' | 'static'

export const MOTION_STORAGE_KEY = 'motion'
export const MOTION_CHANGE_EVENT = 'film:motion-change'

/* Keep in sync with resolveFilmMode() below. No imports, runs before hydration. */
export const MODE_SCRIPT = `(function(){try{var d=document.documentElement,q=new URLSearchParams(location.search).get('film'),m=null;try{m=localStorage.getItem('${MOTION_STORAGE_KEY}')}catch(e){}var r=matchMedia('(prefers-reduced-motion: reduce)').matches,n=navigator,c=n.connection||{},f='film';if(q==='static'||q==='film'||q==='film-lite')f=q;else if(m==='off'||(r&&m!=='on')||!('WebGL2RenderingContext' in window))f='static';else if(c.saveData||(n.deviceMemory||8)<=4||(n.hardwareConcurrency||8)<=4)f='film-lite';d.dataset.film=f;var s=null;try{s=sessionStorage.getItem('intro-seen')}catch(e){}d.dataset.intro=s||f==='static'?'skip':'play';if(location.pathname==='/'&&f!=='static'&&!location.hash)d.dataset.nav='hidden'}catch(e){}})()`

export function resolveFilmMode(): FilmMode {
  if (typeof window === 'undefined') return 'static'
  const query = new URLSearchParams(window.location.search).get('film')
  if (query === 'static' || query === 'film' || query === 'film-lite')
    return query
  const motion = readMotionPreference()
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (
    motion === 'off' ||
    (reduced && motion !== 'on') ||
    !('WebGL2RenderingContext' in window)
  ) {
    return 'static'
  }
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean }
    deviceMemory?: number
  }
  if (
    nav.connection?.saveData ||
    (nav.deviceMemory ?? 8) <= 4 ||
    (nav.hardwareConcurrency || 8) <= 4
  ) {
    return 'film-lite'
  }
  return 'film'
}

export function readMotionPreference(): 'on' | 'off' | null {
  try {
    const value = window.localStorage.getItem(MOTION_STORAGE_KEY)
    return value === 'on' || value === 'off' ? value : null
  } catch {
    return null
  }
}

/** Persists the visitor's choice and switches the page live */
export function setMotionPreference(value: 'on' | 'off') {
  try {
    window.localStorage.setItem(MOTION_STORAGE_KEY, value)
  } catch {
    /* storage blocked — still switch for this page view */
  }
  const mode = value === 'off' ? 'static' : resolveFilmMode()
  document.documentElement.dataset.film = mode
  window.dispatchEvent(new CustomEvent(MOTION_CHANGE_EVENT, { detail: mode }))
}

export function currentFilmMode(): FilmMode {
  const value =
    typeof document === 'undefined'
      ? undefined
      : document.documentElement.dataset.film
  return value === 'film' || value === 'film-lite' ? value : 'static'
}
