import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { CalendarClock, Clock, FileText, Tag } from 'lucide-react'
import { content, projectBySlug, relatedProjects } from '#/content'
import { seoHead } from '#/lib/seo/meta'
import { projectJsonLd } from '#/lib/seo/jsonld'
import { JsonLd } from '#/components/shared/JsonLd'
import { Container } from '#/components/shared/Container'
import { Breadcrumbs } from '#/components/shared/Breadcrumbs'
import { SkillIconCard } from '#/components/shared/SkillIconCard'
import { ProjectCard } from '#/components/shared/ProjectCard'
import { Reveal } from '#/components/motion/Reveal'
import { ReadingProgress } from '#/components/shared/ReadingProgress'
import { Toc } from '#/components/shared/Toc'
import { ProjectMeta } from '#/features/projects/components/ProjectMeta'
import { ProjectStages } from '#/features/projects/components/ProjectStages'
import { ShareActions } from '#/features/projects/components/ShareActions'
import { Gallery } from '#/features/projects/components/Gallery'
import { ArchitectureView } from '#/features/projects/components/ArchitectureView'
import {
  ChallengeCards,
  LessonCards,
  RoadmapCards,
  TradeoffCards,
} from '#/features/projects/components/CaseStudyCards'
import {
  caseStudySections,
  formatDate,
  readingTimeMinutes,
  wordCount,
} from '#/features/projects/lib/case-study'
import type { TocEntry } from '#/components/shared/Toc'
import type { CaseStudySection } from '#/features/projects/lib/case-study'
import type { Project } from '#/content/schemas/project'

export const Route = createFileRoute('/projects/$slug')({
  loader: ({ params }) => {
    const project = projectBySlug(params.slug)
    if (!project) throw notFound()
    return { project }
  },
  head: ({ loaderData }) =>
    loaderData
      ? seoHead({
          title:
            loaderData.project.seo?.title ??
            `${loaderData.project.name} — ${loaderData.project.tagline}`,
          description: loaderData.project.seo?.description ?? loaderData.project.summary,
          path: `/projects/${loaderData.project.slug}`,
          type: 'article',
        })
      : {},
  component: ProjectDetail,
})

function ProjectDetail() {
  const { project } = Route.useLoaderData()
  const sections = caseStudySections(project)
  const related = relatedProjects(project.slug)
  const canonicalUrl = `${content.seo.url}/projects/${project.slug}`

  // A visual-only architecture (no prose section) still gets its own section
  const standaloneArchitecture =
    project.architecture && !sections.some((section) => section.id === 'architecture')

  // TOC covers case-study sections plus the synthetic ones this page adds
  const tocEntries: Array<TocEntry> = [
    ...sections.map((section) => ({ id: section.id, title: section.title })),
    ...(standaloneArchitecture ? [{ id: 'architecture', title: 'Architecture' }] : []),
    ...(project.stages.length > 0 ? [{ id: 'project-timeline', title: 'Timeline' }] : []),
    ...(project.gallery.length > 0 ? [{ id: 'gallery', title: 'Gallery' }] : []),
  ]

  return (
    <>
      <ReadingProgress />
      <Container className="py-section-sm">
        <div className="print:hidden">
          <Breadcrumbs
            items={[
              { name: 'Home', path: '/' },
              { name: 'Projects', path: '/projects' },
              { name: project.name },
            ]}
          />
        </div>

        <JsonLd data={projectJsonLd(project)} />

        <header className="mt-8 max-w-3xl">
          <h1 className="font-display text-display text-foreground">{project.name}</h1>
          <p className="mt-3 text-title-3 text-muted-foreground">{project.tagline}</p>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-small text-subtle-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden />
              {readingTimeMinutes(project)} min read
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FileText className="size-4" aria-hidden />
              {wordCount(project).toLocaleString()} words
            </span>
            {project.updatedAt ? (
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock className="size-4" aria-hidden />
                Updated {formatDate(project.updatedAt)}
              </span>
            ) : null}
            {project.version ? (
              <span className="inline-flex items-center gap-1.5 font-mono">
                <Tag className="size-4" aria-hidden />v{project.version}
              </span>
            ) : null}
          </div>

          <div className="mt-6">
            <ShareActions project={project} url={canonicalUrl} />
          </div>
        </header>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_18rem]">
          <div className="max-w-prose min-w-0">
            <p className="text-body-lg text-muted-foreground">{project.summary}</p>

            <ul className="mt-6 flex flex-wrap gap-1.5 print:hidden" aria-label="Technologies used">
              {project.techStack.map((tech) => (
                <li key={tech}>
                  <Link to="/projects" search={{ tech }} className="group inline-block">
                    <SkillIconCard
                      name={tech}
                      size="sm"
                      className="cursor-pointer transition-colors group-hover:border-accent"
                    />
                  </Link>
                </li>
              ))}
            </ul>

            {sections.map((section) => (
              <section key={section.id} id={section.id} className="mt-14 scroll-mt-24">
                <h2 className="font-display text-title-2 text-foreground">{section.title}</h2>
                <div className="mt-4">
                  <SectionBody section={section} project={project} />
                </div>
              </section>
            ))}

            {standaloneArchitecture && project.architecture ? (
              <section id="architecture" className="mt-14 scroll-mt-24">
                <h2 className="font-display text-title-2 text-foreground">Architecture</h2>
                <ArchitectureView architecture={project.architecture} />
              </section>
            ) : null}

            {project.stages.length > 0 ? (
              <section id="project-timeline" className="mt-14 scroll-mt-24">
                <h2 className="mb-6 font-display text-title-2 text-foreground">Timeline</h2>
                <ProjectStages stages={project.stages} />
              </section>
            ) : null}

            {project.gallery.length > 0 ? (
              <section id="gallery" className="mt-14 scroll-mt-24">
                <h2 className="mb-4 font-display text-title-2 text-foreground">Gallery</h2>
                <Gallery images={project.gallery} title={project.name} />
              </section>
            ) : null}
          </div>

          <aside>
            <div className="space-y-8 lg:sticky lg:top-24">
              <ProjectMeta project={project} />
              <div className="hidden print:hidden lg:block">
                <Toc entries={tocEntries} />
              </div>
            </div>
          </aside>
        </div>

        {related.length > 0 ? (
          <section className="mt-section-sm border-t border-border pt-12 print:hidden">
            <h2 className="mb-8 font-display text-title-2 text-foreground">Related projects</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {related.map((relatedProject, index) => (
                <Reveal key={relatedProject.slug} delay={index * 0.06}>
                  <ProjectCard project={relatedProject} />
                </Reveal>
              ))}
            </div>
          </section>
        ) : null}
      </Container>
    </>
  )
}

/** Picks the renderer for a section based on its typed body. */
function SectionBody({ section, project }: { section: CaseStudySection; project: Project }) {
  const { body } = section
  switch (body.kind) {
    case 'paragraphs':
      return (
        <div className="space-y-4 text-body text-muted-foreground">
          {body.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
          {section.id === 'architecture' && project.architecture ? (
            <ArchitectureView architecture={project.architecture} />
          ) : null}
        </div>
      )
    case 'challenges':
      return <ChallengeCards items={body.items} />
    case 'tradeoffs':
      return <TradeoffCards items={body.items} />
    case 'lessons':
      return <LessonCards items={body.items} />
    case 'roadmap':
      return <RoadmapCards items={body.items} />
  }
}
