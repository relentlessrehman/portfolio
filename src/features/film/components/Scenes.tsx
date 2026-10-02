import type { CSSProperties } from 'react'
import { Link } from '@tanstack/react-router'
import { Github, Linkedin, Mail } from 'lucide-react'
import { content, featuredSocials, projectBySlug } from '#/content'
import {
  ABOUT_LINES,
  CAMPUSFLOW,
  CONTACT_LINES,
  DROP_TAGS,
  IDENTITY_STATEMENT,
  IDENTITY_WORDS,
  MADAD,
  MILESTONES,
  OUTRO,
  STAYZA,
  TRUST_TIERS,
} from '../config/copy'
import { getTechIcon } from '#/lib/tech-icons'
import { Arrow, Corner, Mask, Orb, Pic, Scene } from './primitives'

/* ── ACT I · ARRIVAL ─────────────────────────────────────────────── */

export function IntroScene() {
  return (
    <Scene
      id="intro"
      current
      labelledBy="intro-title"
      back={
        <>
          <Orb className="f-still f-still--intro" />
          <h1 id="intro-title" className="f-display-xxl f-name">
            <span className="f-name__part" data-f="nameA">
              Abdul
            </span>{' '}
            <span className="f-name__part" data-f="nameB">
              Rehman
            </span>
          </h1>
        </>
      }
      front={
        <>
          <Corner sceneId="intro" />
          <p className="f-label f-intro-left" data-f="l1">
            A builder
            <br />
            based in
            <br />
            {content.profile.location.split(',')[0]}
          </p>
          <p className="f-label f-intro-right" data-f="l2">
            Computer science
            <br />
            Startups
            <br />
            Meaningful products
          </p>
          <p className="f-label f-cue" data-f="cue" aria-hidden>
            Scroll to explore
            <span className="f-cue__line" />
          </p>
        </>
      }
    />
  )
}

export function IdentityScene() {
  return (
    <Scene
      id="identity"
      labelledBy="identity-title"
      back={
        <>
          {IDENTITY_WORDS.map((word, index) => (
            <p
              key={word}
              className={`f-display-l f-id-word f-id-word--${index + 1}`}
              data-f={`w${index + 1}`}
            >
              {word}
            </p>
          ))}
          <Orb className="f-still f-still--identity" />
        </>
      }
      front={
        <>
          <Corner sceneId="identity" />
          <h2
            id="identity-title"
            className="f-title f-id-statement"
            data-f="statement"
          >
            <Mask text={IDENTITY_STATEMENT} by="word" f="word" />
          </h2>
        </>
      }
    />
  )
}

export function DropScene() {
  return (
    <Scene
      id="drop"
      labelledBy="drop-title"
      front={
        <>
          <Corner sceneId="drop" />
          <h2 id="drop-title" className="sr-only">
            From ideas to real impact
          </h2>
          <ul className="f-label f-drop-tags" data-f="tags" aria-hidden>
            {DROP_TAGS.map((tag) => (
              <li key={tag} data-f="tag">
                {tag}
              </li>
            ))}
          </ul>
          <Orb className="f-still f-still--drop" />
        </>
      }
    />
  )
}

/* ── ACT II · THE WORK ───────────────────────────────────────────── */

export function StayzaScene() {
  const stayza = projectBySlug('stayza')
  return (
    <Scene
      id="stayza"
      labelledBy="stayza-title"
      back={
        <h2
          id="stayza-title"
          className="f-display-xl f-proj-title"
          data-f="title"
        >
          <Mask text={`${stayza?.name ?? 'Stayza'}.`} by="word" f="tchar" />
        </h2>
      }
      front={
        <>
          <Corner sceneId="stayza" />
          <div className="f-proj-copy" data-f="copy">
            <p className="f-label f-proj-meta">{STAYZA.meta}</p>
            <p className="f-title f-proj-tagline">{STAYZA.tagline}</p>
            <p className="f-body">
              {stayza?.tagline}. Built and run end to end.
            </p>
            <p className="f-ctas">
              <Link
                to="/projects/$slug"
                params={{ slug: 'stayza' }}
                className="f-cta"
                data-beat="0.5"
              >
                View case study <Arrow />
              </Link>
              {stayza?.links.live ? (
                <a
                  href={stayza.links.live}
                  target="_blank"
                  rel="noreferrer"
                  className="f-cta"
                  data-beat="0.5"
                >
                  Visit stayza.pk <Arrow external />
                </a>
              ) : null}
            </p>
            <p className="f-label f-proj-stat">{STAYZA.stat}</p>
          </div>
          <ol
            className="f-label f-index f-proj-index"
            data-f="index"
            aria-hidden
          >
            {STAYZA.index.map((item, index) => (
              <li key={item}>
                <span>0{index + 1}</span> {item}
              </li>
            ))}
          </ol>
          <div className="f-static-only f-static-laptop" aria-hidden>
            <div className="f-laptop-static">
              <Pic
                name="stayza-home"
                widths={[1440, 2400]}
                sizes="(max-width: 600px) 92vw, 50vw"
                ratio={1.6}
              />
            </div>
          </div>
        </>
      }
    />
  )
}

export function StayzaDetailScene() {
  return (
    <Scene
      id="stayza-detail"
      labelledBy="stayza-detail-title"
      back={
        <div className="f-panels" data-f="panels" aria-hidden>
          <div className="f-panel f-panel--1" data-f="panel">
            <Pic
              name="stayza-panel-search"
              widths={[900, 1400]}
              sizes="(max-width: 600px) 90vw, 40vw"
              ratio={1790 / 420}
            />
          </div>
          <div className="f-panel f-panel--2" data-f="panel">
            <Pic
              name="stayza-panel-ai"
              widths={[900, 1400]}
              sizes="(max-width: 600px) 90vw, 40vw"
              ratio={2200 / 540}
            />
          </div>
          <div className="f-panel f-panel--3 f-trust" data-f="panel">
            <p className="f-label">Verification tiers</p>
            <ol>
              {TRUST_TIERS.map((tier, index) => (
                <li key={tier.name}>
                  <span className="f-trust__step">{index + 1}</span>
                  <span>
                    <strong>{tier.name}</strong>
                    <small>{tier.detail}</small>
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <div className="f-panel f-panel--4" data-f="panel">
            <Pic
              name="stayza-panel-compare"
              widths={[700, 1100]}
              sizes="(max-width: 600px) 80vw, 28vw"
              ratio={1280 / 650}
            />
          </div>
        </div>
      }
      front={
        <>
          <Corner sceneId="stayza-detail" />
          <h2 id="stayza-detail-title" className="sr-only">
            Stayza, up close
          </h2>
          <div className="f-stops">
            {STAYZA.stops.map((stop, index) => (
              <div key={stop.label} className="f-stop" data-f="stop">
                <p className="f-label">
                  0{index + 1} · {stop.label}
                </p>
                <h3 className="f-title">{stop.title}</h3>
                <p className="f-body">{stop.body}</p>
              </div>
            ))}
          </div>
        </>
      }
    />
  )
}

export function ToMobileScene() {
  return (
    <Scene
      id="to-mobile"
      labelledBy="to-mobile-title"
      front={
        <>
          <Corner sceneId="to-mobile" />
          <h2 id="to-mobile-title" className="sr-only">
            From web to mobile
          </h2>
          <p className="f-label f-by" data-f="by">
            CampusFlow · by Stayza
          </p>
          <p className="f-body f-static-only">
            The same company, from the web to your pocket.
          </p>
        </>
      }
    />
  )
}

export function CampusFlowScene() {
  const project = projectBySlug('campusflow')
  return (
    <Scene
      id="campusflow"
      className="f-paper"
      labelledBy="campusflow-title"
      back={
        <h2
          id="campusflow-title"
          className="f-display-xl f-proj-title f-proj-title--long"
          data-f="title"
        >
          <Mask
            text={`${project?.name ?? 'CampusFlow'}.`}
            by="word"
            f="tchar"
          />
        </h2>
      }
      front={
        <>
          <Corner sceneId="campusflow" />
          <div className="f-proj-copy f-proj-copy--cf" data-f="copy">
            <p className="f-label f-proj-meta">{CAMPUSFLOW.meta}</p>
            <p className="f-title f-proj-tagline">{CAMPUSFLOW.tagline}</p>
            <p className="f-body">{CAMPUSFLOW.body}</p>
            <p className="f-ctas">
              <Link
                to="/projects/$slug"
                params={{ slug: 'campusflow' }}
                className="f-cta"
                data-beat="0.3"
              >
                View case study <Arrow />
              </Link>
              <a
                href={CAMPUSFLOW.apk}
                target="_blank"
                rel="noreferrer"
                className="f-cta"
                data-beat="0.3"
              >
                Get the APK <Arrow external />
              </a>
            </p>
          </div>
          <ol className="f-label f-index f-cf-index" aria-label="Features">
            {CAMPUSFLOW.features.map((feature, index) => (
              <li key={feature} data-f={`feat${index + 1}`}>
                <span>0{index + 1}</span> {feature}
              </li>
            ))}
          </ol>
          <div className="f-static-only f-static-phone" aria-hidden>
            <div className="f-phone-static">
              <Pic
                name="campusflow-now"
                widths={[480, 900]}
                sizes="240px"
                ratio={1080 / 2290}
              />
            </div>
          </div>
        </>
      }
    />
  )
}

/* ── ACT III · DEPTH ─────────────────────────────────────────────── */

export function MadadScene() {
  const project = projectBySlug('madad')
  return (
    <Scene
      id="madad"
      labelledBy="madad-title"
      back={
        <h2
          id="madad-title"
          className="f-display-xl f-proj-title f-madad-title"
          data-f="title"
        >
          <Mask text={`${project?.name ?? 'Madad'}.`} by="word" f="tchar" />
        </h2>
      }
      front={
        <>
          <Corner sceneId="madad" />
          <div className="f-proj-copy f-madad-copy" data-f="copy">
            <p className="f-label f-proj-meta">
              <span lang="ur">{MADAD.native}</span> · Help ·{' '}
              {MADAD.meta.split(' · ')[0]}
            </p>
            <p className="f-title f-proj-tagline">{MADAD.tagline}</p>
            <p className="f-body">{MADAD.body}</p>
            <p className="f-ctas">
              <Link
                to="/projects/$slug"
                params={{ slug: 'madad' }}
                className="f-cta"
                data-beat="0.45"
              >
                View case study <Arrow />
              </Link>
            </p>
            <p className="f-label f-proj-stat" data-f="counter">
              {MADAD.counter}
            </p>
          </div>
          <div className="f-query" data-f="query">
            <p className="f-query__field">
              <span className="sr-only">Example query: {MADAD.query}</span>
              <span className="f-query__icon" aria-hidden>
                ⌕
              </span>
              <span aria-hidden>
                {MADAD.query.split('').map((char, index) => (
                  <span key={index} data-f="char">
                    {char}
                  </span>
                ))}
              </span>
              <span className="f-query__caret" aria-hidden />
            </p>
            <ol className="f-pipeline">
              {MADAD.pipeline.map((item) => (
                <li key={item.step} data-f="step">
                  <span className="f-label">{item.step}</span>
                  <span className="f-pipeline__note">{item.note}</span>
                </li>
              ))}
            </ol>
          </div>
          <Orb className="f-still f-still--madad" />
        </>
      }
    />
  )
}

export function UnderTheHoodScene() {
  return (
    <Scene
      id="under-the-hood"
      labelledBy="hood-title"
      back={
        <div className="f-panes" data-f="panes">
          {MADAD.panes.map((pane, index) => (
            <article
              key={pane.title}
              className={`f-pane f-pane--${index + 1}`}
              data-f="pane"
            >
              <p className="f-label">0{index + 1}</p>
              <h3 className="f-pane__title">{pane.title}</h3>
              <p className="f-pane__body">{pane.body}</p>
            </article>
          ))}
        </div>
      }
      front={
        <>
          <Corner sceneId="under-the-hood" />
          <h2 id="hood-title" className="f-label f-hood-title" data-f="htitle">
            Madad · under the hood
          </h2>
          <div className="f-hood-foot" data-f="foot">
            <p className="f-label">{MADAD.tests}</p>
            <p className="f-body">{MADAD.origin}</p>
          </div>
        </>
      }
    />
  )
}

/* ── ACT IV · THE PERSON ─────────────────────────────────────────── */

export function AboutScene() {
  const { profile } = content
  return (
    <Scene
      id="about"
      labelledBy="about-title"
      front={
        <>
          <Corner sceneId="about" />
          <div className="f-portrait" data-f="portrait">
            <Pic
              name="portrait"
              widths={[720, 1254]}
              sizes="(max-width: 600px) 100vw, 55vw"
              ratio={1}
              alt={`Portrait of ${profile.name}`}
            />
          </div>
          <div className="f-about-copy">
            <p className="f-label" data-f="kicker">
              Behind the work
            </p>
            <h2 id="about-title" className="f-display-l f-about-lines">
              {ABOUT_LINES.map((line) => (
                <span key={line} className="f-about-line">
                  <Mask text={line} by="line" f="line" />
                </span>
              ))}
            </h2>
            <div className="f-about-bio" data-f="bio">
              <p className="f-body">
                {profile.shortBio} Based in {profile.location.split(',')[0]}.
              </p>
              <p className="f-ctas">
                <Link to="/about" className="f-cta" data-beat="0.6">
                  More about me <Arrow />
                </Link>
              </p>
            </div>
          </div>
        </>
      }
    />
  )
}

export function TimelineScene() {
  return (
    <Scene
      id="timeline"
      labelledBy="timeline-title"
      front={
        <>
          <Corner sceneId="timeline" />
          <h2
            id="timeline-title"
            className="f-label f-tl-title"
            data-f="ttitle"
          >
            So far
          </h2>
          <div className="f-tl" data-f="tl">
            <span className="f-tl__line" aria-hidden />
            <ol className="f-tl__track" data-f="track">
              {MILESTONES.map((milestone) => (
                <li
                  key={milestone.when + milestone.what}
                  className="f-tl__item"
                  data-f="ms"
                >
                  <span className="f-tl__dot" aria-hidden />
                  <span className="f-label f-tl__when">{milestone.when}</span>
                  <span className="f-tl__what">{milestone.what}</span>
                </li>
              ))}
            </ol>
          </div>
        </>
      }
    />
  )
}

/* ── Toolkit: only what the projects actually use ────────────────── */

const TOOLKIT_ROWS = [
  { id: 'languages', label: 'Languages', categories: ['language'] },
  { id: 'interfaces', label: 'Interfaces & mobile', categories: ['frontend'] },
  {
    id: 'backend',
    label: 'Backend & data',
    categories: ['backend', 'database', 'tools', 'concepts'],
  },
] as const

/** Every technology in a project's techStack, with the projects that use it */
function buildToolkit() {
  const usage = new Map<string, Array<string>>()
  // hero projects first, so "used in" reads Stayza / CampusFlow / Madad before the rest
  const ordered = [...content.projects].sort(
    (a, b) => (a.film === 'hero' ? 0 : 1) - (b.film === 'hero' ? 0 : 1),
  )
  for (const project of ordered) {
    for (const tech of project.techStack) {
      usage.set(tech, [...(usage.get(tech) ?? []), project.name])
    }
  }
  const categoryOf = (name: string) =>
    content.skills.find((skill) => skill.name === name)?.category ?? 'tools'
  const rows = TOOLKIT_ROWS.map((row) => ({
    ...row,
    items: [...usage.entries()]
      .filter(([name]) =>
        (row.categories as ReadonlyArray<string>).includes(categoryOf(name)),
      )
      .sort((a, b) => b[1].length - a[1].length)
      .map(([name, projects]) => ({ name, projects })),
  }))
  return { rows, total: usage.size, projects: content.projects.length }
}

export function ToolkitScene() {
  const { rows, total, projects } = buildToolkit()
  return (
    <Scene
      id="toolkit"
      labelledBy="toolkit-title"
      front={
        <>
          <Corner sceneId="toolkit" />
          <div className="f-tk-head">
            <p className="f-label" data-f="tkkicker">
              What I build with
            </p>
            <h2 id="toolkit-title" className="f-display-l">
              <Mask text="Toolkit." by="word" f="tchar" />
            </h2>
            <p className="f-body" data-f="tkbody">
              {total} technologies across {projects} projects. Only what my
              projects actually use.
            </p>
          </div>
          <div className="f-tk-rows">
            {rows.map((row) => (
              <div key={row.id} className="f-tk-row" data-f="tkrow">
                <p className="f-label f-tk-row__label">{row.label}</p>
                <ul className="f-tk-track" data-f="tktrack">
                  {row.items.map((item) => {
                    const entry = getTechIcon(item.name)
                    const Icon = entry?.icon
                    return (
                      <li
                        key={item.name}
                        className="f-chip"
                        data-f="chip"
                        style={
                          entry?.color
                            ? ({ '--brand': entry.color } as CSSProperties)
                            : undefined
                        }
                      >
                        {Icon ? (
                          <Icon className="f-chip__icon" aria-hidden />
                        ) : (
                          <span className="f-chip__icon" aria-hidden />
                        )}
                        <span className="f-chip__text">
                          <span className="f-chip__name">{item.name}</span>
                          <span className="f-chip__used">
                            {item.projects.slice(0, 3).join(' · ')}
                            {item.projects.length > 3
                              ? ` +${item.projects.length - 3}`
                              : ''}
                          </span>
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </>
      }
    />
  )
}

/* ── ACT V · CONVERGE ────────────────────────────────────────────── */

export function ExperimentsScene() {
  const projects = content.projects.filter(
    (project) => project.film === 'experiment',
  )
  return (
    <Scene
      id="experiments"
      labelledBy="experiments-title"
      front={
        <>
          <Corner sceneId="experiments" />
          <div className="f-exp-head" data-f="head">
            <h2 id="experiments-title" className="f-display-l">
              <Mask text="More work." by="word" f="tchar" />
            </h2>
            <p className="f-body">
              A hackathon build, a desktop tool and a course project.
            </p>
          </div>
          <ul className="f-cards" data-interactive>
            {projects.map((project) => (
              <li key={project.slug} className="f-card" data-f="card">
                <Link
                  to="/projects/$slug"
                  params={{ slug: project.slug }}
                  className="f-card__link"
                  data-beat="0.5"
                >
                  <span className="f-card__cover" aria-hidden>
                    <span className="f-card__initial">
                      {project.name.charAt(0)}
                    </span>
                    <Orb className="f-card__orb" />
                  </span>
                  <span className="f-card__name">{project.name}</span>
                  <span className="f-card__line">{project.tagline}</span>
                  <span className="f-label f-card__meta">
                    {project.timeline.start.slice(0, 4)} ·{' '}
                    {project.techStack.slice(0, 2).join(', ')} <Arrow />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      }
    />
  )
}

export function ContactScene() {
  const resume = content.resume.versions.length > 0
  const icons: Record<string, typeof Mail | undefined> = {
    email: Mail,
    github: Github,
    linkedin: Linkedin,
  }
  return (
    <Scene
      id="contact"
      labelledBy="contact-title"
      back={
        <div className="f-thumbs" aria-hidden>
          <div className="f-thumb f-thumb--1" data-f="thumb">
            <Pic name="stayza-home" widths={[1440]} sizes="20vw" ratio={1.6} />
          </div>
          <div className="f-thumb f-thumb--2" data-f="thumb">
            <Pic
              name="campusflow-now"
              widths={[480]}
              sizes="10vw"
              ratio={1080 / 2290}
            />
          </div>
          <div className="f-thumb f-thumb--3" data-f="thumb">
            <Pic name="portrait" widths={[720]} sizes="14vw" ratio={1} />
          </div>
          <div className="f-thumb f-thumb--4" data-f="thumb">
            <Pic
              name="stayza-panel-ai"
              widths={[900]}
              sizes="20vw"
              ratio={2200 / 540}
            />
          </div>
        </div>
      }
      front={
        <>
          <Corner sceneId="contact" />
          <h2 id="contact-title" className="f-display-xl f-contact-title">
            <span className="sr-only">
              Let&apos;s build something worthwhile.
            </span>
            <span aria-hidden>
              {CONTACT_LINES.map((line, index) => (
                <span key={line} className="f-contact-line">
                  <span className="f-mask">
                    <span className="f-mask__in" data-f="cline">
                      {line}
                      {index === CONTACT_LINES.length - 1 ? (
                        <span className="f-period" data-anchor="period">
                          .
                        </span>
                      ) : null}
                    </span>
                  </span>
                </span>
              ))}
            </span>
          </h2>
          <div className="f-contact-actions" data-f="actions">
            <Link to="/contact" className="f-pill" data-beat="0.7">
              Let&apos;s talk <Arrow />
            </Link>
            <ul className="f-socials">
              {featuredSocials.map((link) => {
                const Icon = icons[link.platform]
                return (
                  <li key={link.platform}>
                    <a
                      href={link.url}
                      target={link.platform === 'email' ? undefined : '_blank'}
                      rel="noreferrer"
                      aria-label={link.label}
                      className="f-social"
                      data-beat="0.7"
                    >
                      {Icon ? (
                        <Icon className="size-4" aria-hidden />
                      ) : (
                        link.label
                      )}
                    </a>
                  </li>
                )
              })}
            </ul>
            {resume ? (
              <Link to="/resume" className="f-cta" data-beat="0.7">
                Résumé <Arrow />
              </Link>
            ) : null}
          </div>
          <Orb className="f-still f-still--contact" />
        </>
      }
    />
  )
}

export function OutroScene() {
  return (
    <Scene
      id="outro"
      labelledBy="outro-title"
      front={
        <>
          <h2 id="outro-title" className="f-label f-outro" data-f="outro">
            {OUTRO}
          </h2>
          <Orb className="f-still f-still--outro" />
        </>
      }
    />
  )
}
