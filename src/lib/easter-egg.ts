import { content } from '#/content'

let printed = false

/** Tasteful DevTools greeting — driven entirely by content, printed once. */
export function printConsoleGreeting(): void {
  if (typeof window === 'undefined' || printed) return
  printed = true

  const { profile, socials } = content
  const styles = getComputedStyle(document.documentElement)
  const muted = styles.getPropertyValue('--muted-foreground').trim() || 'gray'

  const links = socials
    .map((link) => `  ${link.label.padEnd(10)} ${link.url.replace('mailto:', '')}`)
    .join('\n')

  console.log(
    `%c${profile.name}%c\n${profile.role}\n\n%cCurious about how this site is built? I like you already.\n\n${links}\n\n"${profile.motto}"`,
    'font-size: 20px; font-weight: 600; font-family: Georgia, serif;',
    'font-size: 12px;',
    `font-size: 12px; color: ${muted};`,
  )
}
