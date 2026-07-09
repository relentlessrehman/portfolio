/** Lets any component (e.g. a Navbar search button) open the palette without prop drilling. */
export const OPEN_COMMAND_PALETTE_EVENT = 'open-command-palette'

export function openCommandPalette() {
  window.dispatchEvent(new Event(OPEN_COMMAND_PALETTE_EVENT))
}
