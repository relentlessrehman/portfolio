import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '#/components/ui/button'

interface CopyButtonProps {
  value: string
  /** Accessible label, e.g. "Copy email address" */
  label: string
}

export function CopyButton({ value, label }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<number>(undefined)

  useEffect(() => () => window.clearTimeout(timeoutRef.current), [])

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard unavailable (permissions/insecure context) — leave the
      // value visible next to the button as the fallback.
    }
  }

  return (
    <Button type="button" variant="secondary" size="md" onClick={copy} aria-label={label}>
      {copied ? <Check className="text-success" aria-hidden /> : <Copy aria-hidden />}
      {copied ? 'Copied' : 'Copy'}
    </Button>
  )
}
