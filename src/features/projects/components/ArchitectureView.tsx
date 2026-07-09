import { useEffect, useRef, useState } from 'react'
import { Workflow } from 'lucide-react'
import type { Architecture } from '#/content/schemas/project'

/**
 * Renders whatever architecture visualization a project declares:
 * uploaded image, Mermaid diagram (lazy-loaded, never in the main bundle),
 * a simple node graph, or a placeholder. The page code never changes.
 */
export function ArchitectureView({ architecture }: { architecture: Architecture }) {
  switch (architecture.type) {
    case 'image':
      return (
        <img
          src={architecture.image.src}
          alt={architecture.image.alt}
          width={architecture.image.width}
          height={architecture.image.height}
          loading="lazy"
          className="mt-6 w-full rounded-md border border-border"
        />
      )
    case 'mermaid':
      return <MermaidDiagram code={architecture.code} />
    case 'graph':
      return <NodeGraph nodes={architecture.nodes} edges={architecture.edges} />
    case 'placeholder':
      return (
        <div className="mt-6 flex flex-col items-center gap-2 rounded-md border border-dashed border-border-strong p-10 text-center">
          <Workflow className="size-6 text-subtle-foreground" aria-hidden />
          <p className="text-small text-subtle-foreground">Architecture diagram coming soon</p>
        </div>
      )
  }
}

/* ── Mermaid (lazy) ─────────────────────────────────────────────────── */

function MermaidDiagram({ code }: { code: string }) {
  const [svg, setSvg] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const idRef = useRef(`mermaid-${Math.random().toString(36).slice(2)}`)

  useEffect(() => {
    let cancelled = false
    import('mermaid')
      .then(async ({ default: mermaid }) => {
        mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'strict' })
        const rendered = await mermaid.render(idRef.current, code)
        if (!cancelled) setSvg(rendered.svg)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [code])

  if (failed) {
    return (
      <pre className="mt-6 overflow-x-auto rounded-md border border-border bg-surface p-4 font-mono text-mono-sm text-muted-foreground">
        {code}
      </pre>
    )
  }

  return (
    <div
      role="img"
      aria-label="Architecture diagram"
      className="mt-6 overflow-x-auto rounded-md border border-border bg-surface p-4 [&_svg]:mx-auto"
      // Mermaid output is generated from our own content with securityLevel: strict
      dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
    >
      {svg ? undefined : (
        <p className="text-center text-small text-subtle-foreground">Rendering diagram…</p>
      )}
    </div>
  )
}

/* ── Simple node graph (no dependency) ──────────────────────────────── */

type GraphArchitecture = Extract<Architecture, { type: 'graph' }>

const CELL_W = 168
const CELL_H = 88
const NODE_W = 136
const NODE_H = 48

function NodeGraph({ nodes, edges }: Pick<GraphArchitecture, 'nodes' | 'edges'>) {
  const cols = Math.max(...nodes.map((node) => node.x)) + 1
  const rows = Math.max(...nodes.map((node) => node.y)) + 1
  const center = (node: GraphArchitecture['nodes'][number]) => ({
    cx: node.x * CELL_W + CELL_W / 2,
    cy: node.y * CELL_H + CELL_H / 2,
  })
  const byId = new Map(nodes.map((node) => [node.id, node]))

  return (
    <div className="mt-6 overflow-x-auto rounded-md border border-border bg-surface p-4">
      <svg
        viewBox={`0 0 ${cols * CELL_W} ${rows * CELL_H}`}
        className="mx-auto h-auto w-full"
        style={{ maxWidth: cols * CELL_W }}
        role="img"
        aria-label="Architecture diagram"
      >
        {edges.map((edge) => {
          const from = byId.get(edge.from)
          const to = byId.get(edge.to)
          if (!from || !to) return null
          const a = center(from)
          const b = center(to)
          return (
            <g key={`${edge.from}-${edge.to}`}>
              <line
                x1={a.cx}
                y1={a.cy}
                x2={b.cx}
                y2={b.cy}
                stroke="var(--color-border-strong)"
                strokeWidth={1.5}
              />
              {edge.label ? (
                <text
                  x={(a.cx + b.cx) / 2}
                  y={(a.cy + b.cy) / 2 - 6}
                  textAnchor="middle"
                  fill="var(--color-subtle-foreground)"
                  fontSize={11}
                  fontFamily="var(--font-mono)"
                >
                  {edge.label}
                </text>
              ) : null}
            </g>
          )
        })}
        {nodes.map((node) => {
          const { cx, cy } = center(node)
          return (
            <g key={node.id}>
              <rect
                x={cx - NODE_W / 2}
                y={cy - NODE_H / 2}
                width={NODE_W}
                height={NODE_H}
                rx={8}
                fill="var(--color-surface-raised)"
                stroke="var(--color-border-strong)"
              />
              <text
                x={cx}
                y={cy + 4}
                textAnchor="middle"
                fill="var(--color-foreground)"
                fontSize={12.5}
                fontFamily="var(--font-mono)"
              >
                {node.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
