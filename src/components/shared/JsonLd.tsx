interface JsonLdProps {
  data: Record<string, unknown>
}

/** Emits a JSON-LD structured-data block for the current page. */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger -- JSON.stringify output of our own builders, no user input
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
