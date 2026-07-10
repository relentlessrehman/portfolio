/** Lets any component (e.g. the Navbar menu button) open the mobile nav drawer without prop drilling. */
export const OPEN_MOBILE_NAV_EVENT = 'open-mobile-nav'

export function openMobileNav() {
  window.dispatchEvent(new Event(OPEN_MOBILE_NAV_EVENT))
}
