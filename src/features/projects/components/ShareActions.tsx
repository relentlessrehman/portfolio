import { useEffect, useState } from 'react'
import { ArrowUpRight, Github, Share2 } from 'lucide-react'
import { CopyButton } from '#/components/shared/CopyButton'
import { Button, buttonVariants } from '#/components/ui/button'
import type { Project } from '#/content/schemas/project'

interface ShareActionsProps {
  project: Project
  /** Canonical URL of the case study */
  url: string
}

/** Copy URL, native share (when the platform supports it), GitHub, live demo. */
export function ShareActions({ project, url }: ShareActionsProps) {
  // navigator.share exists only on the client — gate after mount to keep SSR markup stable
  const [canShare, setCanShare] = useState(false)
  useEffect(() => {
    setCanShare(typeof navigator.share === 'function')
  }, [])

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <CopyButton value={url} label="Copy link to this case study" />
      {canShare ? (
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={() => {
            navigator.share({ title: project.name, text: project.summary, url }).catch(() => {
              // User dismissed the share sheet — nothing to do
            })
          }}
        >
          <Share2 aria-hidden />
          Share
        </Button>
      ) : null}
      {project.links.github ? (
        <a
          href={project.links.github}
          target="_blank"
          rel="noreferrer"
          className={buttonVariants({ variant: 'secondary', size: 'md' })}
        >
          <Github aria-hidden />
          GitHub
        </a>
      ) : null}
      {project.links.live ? (
        <a
          href={project.links.live}
          target="_blank"
          rel="noreferrer"
          className={buttonVariants({ variant: 'secondary', size: 'md' })}
        >
          Live demo
          <ArrowUpRight aria-hidden />
        </a>
      ) : null}
    </div>
  )
}
