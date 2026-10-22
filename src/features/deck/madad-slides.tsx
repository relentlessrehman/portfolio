import { Fragment } from 'react'
import {
  ArrowRight,
  FileText,
  Layers,
  MessageSquareText,
  Search,
  ShieldCheck,
} from 'lucide-react'
import { Glass } from './Glass'
import { R, Rise } from './Deck'
import type { SlideDef } from './Deck'

/*
 * Madad: CS272 project proposal. The idea is one offline study loop
 * (organize, ask, practice, know what's next), powered by two native models:
 * Madad Organizer (~100M) before ingestion and Madad Tutor (~300M) after
 * retrieval. Everything is described as proposed, never as finished.
 *
 * Droplet poses use world space: x ∈ [-8, 8] maps to 0 to 100cqw,
 * y ∈ [4.5, -4.5] maps to 0 to 100cqh. Drops with z < 0 sit behind the glass.
 */

const team = [
  { name: 'Abdul Rehman', cms: '576841' },
  { name: 'Muhammad Kaleem Sajjad', cms: '544147' },
  { name: 'Muhammad Affan', cms: '577327' },
]

function FlowArrow() {
  return (
    <svg className="flow-arrow" viewBox="0 0 64 22" fill="none" aria-hidden>
      <path
        d="M2 11h54"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M50 4l8 7-8 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ strokeDasharray: 'none', animation: 'none' }}
      />
    </svg>
  )
}

function SpecimenBar({ label }: { label: string }) {
  return (
    <div className="specimen__bar">
      <span className="specimen__lights" aria-hidden>
        <i />
        <i />
        <i />
      </span>
      <span className="label">{label}</span>
    </div>
  )
}

function Title() {
  return (
    <div className="s-title" style={{ height: '100%' }}>
      <Rise as="h1" text="Madad." className="t-hero metal" />
      <R
        as="p"
        className="lede"
        style={{ fontSize: '1.95cqw', maxWidth: '30ch' }}
      >
        Your course files, organized, explained and remembered. All on your own
        laptop.
      </R>
      <R as="p" className="course-line">
        <b>CS272 Artificial Intelligence</b> · Project Proposal · October 2026
      </R>
      <div className="team">
        {team.map((member) => (
          <R key={member.cms}>
            <Glass className="member">
              <p className="member__name">{member.name}</p>
              <span className="member__cms">CMS {member.cms}</span>
            </Glass>
          </R>
        ))}
      </div>
    </div>
  )
}

function StateOfArt() {
  const cards = [
    {
      icon: <MessageSquareText />,
      title: 'AI tutors',
      tools: 'ChatGPT · Khanmigo',
      body: 'Explain any topic in a conversation, and adapt to follow-up questions.',
    },
    {
      icon: <FileText />,
      title: 'Grounded answers',
      tools: 'NotebookLM · RAG',
      cite: 'Lewis et al., 2020',
      body: 'Answer from the files you upload, and cite the source.',
    },
    {
      icon: <Layers />,
      title: 'Smart revision',
      tools: 'Anki · FSRS',
      cite: 'Ye et al., 2022',
      body: 'Schedule each review just before you would forget.',
    },
    {
      icon: <Search />,
      title: 'Local AI',
      tools: 'AnythingLLM · LLaMA, Qwen',
      body: 'Chat with your documents offline, using open pretrained models.',
    },
  ]
  return (
    <>
      <div className="s-problem__head">
        <Rise text="The state of the art." className="t-1 metal" />
        <R as="p" className="lede">
          Students study from hundreds of their own files. Today&apos;s best
          tools help, but each one solves only one piece.
        </R>
      </div>
      <div className="s-problem__cards s-problem__cards--4">
        {cards.map((card) => (
          <R key={card.title}>
            <Glass className="card">
              <div className="card__icon">{card.icon}</div>
              <h3 className="t-3">{card.title}</h3>
              <span className="tools-line">{card.tools}</span>
              <p className="body">{card.body}</p>
              {'cite' in card ? (
                <span className="card__ref">{card.cite}</span>
              ) : null}
            </Glass>
          </R>
        ))}
      </div>
    </>
  )
}

type Mark = 'yes' | 'part' | 'no'

const markWord: Record<Mark, string> = { yes: 'Yes', part: 'Partly', no: 'No' }

function Gaps() {
  const needs = [
    'Works offline',
    'Uses your own files',
    'Sorts messy folders',
    'Checks every citation',
    'Finds your weak topics',
  ]
  const rows: Array<{ tool: string; marks: Array<Mark>; ours?: boolean }> = [
    { tool: 'ChatGPT', marks: ['no', 'part', 'no', 'no', 'no'] },
    { tool: 'NotebookLM', marks: ['no', 'yes', 'no', 'part', 'no'] },
    { tool: 'Anki', marks: ['yes', 'part', 'no', 'no', 'part'] },
    { tool: 'AnythingLLM', marks: ['yes', 'yes', 'no', 'no', 'no'] },
    { tool: 'Madad', marks: ['yes', 'yes', 'yes', 'yes', 'yes'], ours: true },
  ]
  return (
    <div className="s-gaps">
      <div className="s-gaps__head">
        <Rise text="The gaps we found." className="t-1 metal" />
        <R as="p" className="lede">
          No tool sorts your files, checks every citation and tracks what you
          are weak at, all offline. Even a cited answer is often only partly
          supported by its source (Gao&nbsp;et&nbsp;al.,&nbsp;2023).
        </R>
      </div>
      <R>
        <Glass className="matrix" strength={30}>
          <table>
            <thead>
              <tr>
                <th scope="col">
                  <span className="sr-only">Tool</span>
                </th>
                {needs.map((need) => (
                  <th key={need} scope="col">
                    {need}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.tool} className={row.ours ? 'is-ours' : undefined}>
                  <th scope="row">
                    {row.tool}
                    {row.ours ? (
                      <span className="matrix__tag">Proposed</span>
                    ) : null}
                  </th>
                  {row.marks.map((mark, k) => (
                    <td key={needs[k]}>
                      <span
                        className={`mark mark--${mark}`}
                        role="img"
                        aria-label={markWord[mark]}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="matrix__legend">
            <span>
              <span className="mark mark--yes" aria-hidden /> Yes
            </span>
            <span>
              <span className="mark mark--part" aria-hidden /> Partly
            </span>
            <span>
              <span className="mark mark--no" aria-hidden /> No
            </span>
            <span className="matrix__src">
              From each tool&apos;s public documentation, October 2026
            </span>
          </div>
        </Glass>
      </R>
    </div>
  )
}

function Idea() {
  const steps = [
    {
      n: '01',
      title: 'Organize',
      body: 'No study tool sorts your files. Madad reads them and sorts them.',
    },
    {
      n: '02',
      title: 'Ask',
      body: 'Answers from your own slides, with every citation checked.',
    },
    {
      n: '03',
      title: 'Practice',
      body: 'The same slides become quiz questions. No cards to write.',
    },
    {
      n: '04',
      title: 'Know what is next',
      body: 'Your answers reveal weak topics, so you study what matters.',
    },
  ]
  return (
    <div className="s-idea" style={{ height: '100%' }}>
      <div className="s-idea__head">
        <Rise
          text="What is new: one offline study loop."
          className="t-1 metal"
        />
        <R as="p" className="lede">
          Two models we train from scratch close every gap, in one tool that
          never leaves your laptop.
        </R>
      </div>
      <div className="s-idea__steps">
        {steps.map((step, i) => (
          <Fragment key={step.n}>
            <R>
              <Glass className="step">
                <span className="step__n">{step.n}</span>
                <h3 className="t-3">{step.title}</h3>
                <p className="body">{step.body}</p>
              </Glass>
            </R>
            {i < steps.length - 1 ? (
              <R>
                <FlowArrow />
              </R>
            ) : null}
          </Fragment>
        ))}
      </div>
    </div>
  )
}

function Organizer() {
  const rows = [
    {
      file: 'lecture3.pdf',
      path: ['Database Systems', 'ER Modeling'],
    },
    {
      file: 'week4_slides.pptx',
      path: ['OOP', 'Inheritance'],
    },
    {
      file: 'lecture3 (1).pdf',
      path: ['Duplicate, kept once'],
      review: true,
    },
    {
      file: 'IMG_2041.jpg',
      path: ['New course? You decide'],
      review: true,
    },
  ]
  return (
    <div className="split">
      <div className="split__copy">
        <Rise text="Madad Organizer." className="t-1 metal" />
        <R>
          <span className="chip chip--accent">Model 01 · ~100M parameters</span>
        </R>
        <R as="p" className="lede">
          Reads what is inside each file, not just its name, and decides where
          it belongs.
        </R>
        <R as="ul" className="ticks">
          <li>
            Already organized? Skip it. Half organized? It sorts only the loose
            files.
          </li>
          <li>Shows a preview first. Nothing moves until you approve.</li>
          <li>Unsure, or a brand new course? It asks instead of guessing.</li>
          <li>Duplicates are caught, and every move can be undone.</li>
        </R>
      </div>
      <R>
        <Glass className="specimen">
          <SpecimenBar label="Example" />
          {rows.map((row) => (
            <div
              key={row.file}
              className={row.review ? 'org-row org-row--review' : 'org-row'}
            >
              <span className="org-file">
                <FileText />
                {row.file}
              </span>
              <ArrowRight className="org-arrow" />
              <span className="org-path">
                {row.path.map((part, i) => (
                  <span key={part}>
                    {i > 0 ? <i>/ </i> : null}
                    {i === row.path.length - 1 ? <b>{part}</b> : part}
                  </span>
                ))}
              </span>
            </div>
          ))}
          <div className="specimen__foot">
            <span className="chip">Preview</span>
            <span className="chip chip--accent">Approve</span>
          </div>
        </Glass>
      </R>
    </div>
  )
}

function Tutor() {
  return (
    <div className="split">
      <div className="split__copy">
        <Rise text="Madad Tutor." className="t-1 metal" />
        <R>
          <span className="chip chip--accent">Model 02 · ~300M parameters</span>
        </R>
        <R as="p" className="lede">
          Answers from your own course material, and shows exactly where every
          answer came from.
        </R>
        <R as="ul" className="ticks">
          <li>Explains, compares, summarizes and quizzes you.</li>
          <li>Every citation is checked against the real slide.</li>
          <li>Remembers your last few questions for follow-ups.</li>
          <li>Model still learning? Madad shows the best passages instead.</li>
        </R>
      </div>
      <R>
        <Glass className="specimen">
          <SpecimenBar label="Example" />
          <div className="bubble-q">What is third normal form?</div>
          <div className="retrieved">
            <span className="label">Found in your course</span>
            <div className="sources">
              <span className="source">
                <b>1</b> Lecture_07.pdf · slide 12
              </span>
              <span className="source">
                <b>2</b> Lecture_07.pdf · slide 14
              </span>
            </div>
          </div>
          <div className="answer">
            A table is in third normal form when it is in 2NF and no column
            depends on another non-key column
            <span className="cite">1</span>. Every column depends on the key and
            nothing else
            <span className="cite">2</span>.
          </div>
          <div className="guard">
            <ShieldCheck />
            <span>
              <b className="ink">No evidence, no answer.</b> It never guesses.
            </span>
          </div>
        </Glass>
      </R>
    </div>
  )
}

function Scratch() {
  const layers = [
    { label: 'Output heads', note: 'answers · labels', top: '16%' },
    { label: 'Transformer blocks', note: 'attention', top: '30.5%' },
    { label: 'Positions', note: 'RoPE', top: '45%' },
    { label: 'Embeddings', note: 'learned', top: '59.5%' },
    { label: 'Tokenizer', note: 'our own', top: '74%' },
  ]
  return (
    <div className="s-scratch">
      <div className="split__copy">
        <Rise text="Built from scratch. Not borrowed." className="t-1 metal" />
        <R as="p" className="lede">
          We train our own tokenizer and start both models from random weights.
          No LLaMA, no Qwen. Search finds the facts, so the model only has to
          explain them. That is why it can stay small.
        </R>
        <div className="facts">
          <R>
            <Glass className="fact">
              <h3 className="t-3">Public data</h3>
              <p className="body">
                FineWeb-Edu, SciQ and OpenBookQA to learn. MMLU only to test.
              </p>
            </Glass>
          </R>
          <R>
            <Glass className="fact">
              <h3 className="t-3">Our own data</h3>
              <p className="body">
                Hand-labelled course files. Test courses never seen in training.
              </p>
            </Glass>
          </R>
        </div>
      </div>
      <R className="stack">
        <div className="stack__scene" aria-hidden>
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={i === 3 ? 'slab slab--accent' : 'slab'}
              style={{
                transform: `perspective(160cqw) rotateX(58deg) rotateZ(-38deg) translateZ(${(i - 2) * 12}cqh)`,
              }}
            />
          ))}
        </div>
        <div className="stack__labels">
          {layers.map((layer) => (
            <span
              key={layer.label}
              className="stack__label"
              style={{ top: layer.top }}
            >
              <b className="ink" style={{ fontWeight: 600 }}>
                {layer.label}
              </b>
              <span className="mono">{layer.note}</span>
            </span>
          ))}
        </div>
      </R>
    </div>
  )
}

function Fit() {
  const nodes = [
    { title: 'Organizer', body: 'Optional', isNew: true },
    { title: 'Read', body: 'PDF, slides, scans' },
    { title: 'Split', body: 'Small passages' },
    { title: 'Understand', body: 'Meaning and topic' },
    { title: 'Search', body: 'Best passages' },
    { title: 'Tutor', body: 'Writes the answer', isNew: true },
    { title: 'Answer', body: 'With sources' },
  ]
  return (
    <div className="s-fit">
      <div className="s-fit__head">
        <Rise text="Two models. One pipeline." className="t-1 metal" />
      </div>
      <div style={{ alignSelf: 'center' }}>
        <div className="pipe">
          {nodes.map((node) => (
            <R key={node.title}>
              <Glass
                className={
                  node.isNew ? 'pipe__node pipe__node--new' : 'pipe__node'
                }
                strength={30}
              >
                <span className="pipe__tag">
                  {node.isNew ? 'New' : 'Today'}
                </span>
                <h3 className="t-3">{node.title}</h3>
                <p className="body">{node.body}</p>
              </Glass>
            </R>
          ))}
        </div>
        <R className="brackets">
          <span className="bracket bracket--new">New model</span>
          <span className="bracket">Madad Brain · Python</span>
          <span className="bracket">Engine · C++</span>
          <span className="bracket bracket--new">New model</span>
        </R>
      </div>
      <div className="s-fit__foot">
        <R as="p" className="lede" style={{ maxWidth: '44ch' }}>
          Everything Madad does today stays exactly as it is. The new models
          plug in at both ends, and the Organizer can be skipped.
        </R>
        <R>
          <span className="chip">No cloud · No account</span>
        </R>
      </div>
    </div>
  )
}

function Plan() {
  const steps = [
    { n: '01', title: 'Collect', body: 'Gather and clean the data.' },
    { n: '02', title: 'Tokenize', body: 'Build our own vocabulary.' },
    { n: '03', title: 'Pretrain', body: 'Learn language from text.' },
    { n: '04', title: 'Ground', body: 'Answer only from evidence.' },
    { n: '05', title: 'Organize', body: 'Learn course, topic, type.' },
    { n: '06', title: 'Test', body: 'On files it has never seen.' },
  ]
  const goals = [
    {
      title: 'Organizer works if',
      body: 'Known files land in the right folder, and unfamiliar ones come to you.',
    },
    {
      title: 'Tutor works if',
      body: 'Answers match the slides they cite, and it refuses when unsure.',
    },
    {
      title: 'Madad works if',
      body: 'Nothing that works today breaks. If a model falls short, search still answers.',
    },
  ]
  return (
    <div className="s-plan">
      <div className="s-problem__head" style={{ maxWidth: '70cqw' }}>
        <Rise
          text="How we build it, and how we test it."
          className="t-1 metal"
        />
      </div>
      <div className="timeline">
        {steps.map((step) => (
          <R key={step.n} className="tl">
            <span className="tl__dot" style={{ top: '-3.2cqh' }} aria-hidden />
            <span className="mono">{step.n}</span>
            <h3 className="t-3">{step.title}</h3>
            <p className="body">{step.body}</p>
          </R>
        ))}
      </div>
      <div className="goals">
        {goals.map((goal) => (
          <R key={goal.title}>
            <Glass className="card" style={{ minHeight: '20cqh' }}>
              <h3 className="t-3 accent">{goal.title}</h3>
              <p className="body" style={{ color: 'var(--ink-2)' }}>
                {goal.body}
              </p>
            </Glass>
          </R>
        ))}
      </div>
    </div>
  )
}

function Close() {
  return (
    <div className="s-close" style={{ height: '100%' }}>
      <Rise text="Help that never leaves your laptop." className="t-1 metal" />
      <R className="pills">
        <span className="chip">Sorts messy folders</span>
        <span className="chip">Checks every citation</span>
        <span className="chip">Fully offline</span>
        <span className="chip chip--accent">Trained from scratch</span>
      </R>
      <R className="s-close__thanks">
        <p className="t-2 metal">Thank you.</p>
        <p className="lede" style={{ marginTop: '1cqh' }}>
          Questions?
        </p>
      </R>
    </div>
  )
}

export const madadSlides: ReadonlyArray<SlideDef> = [
  {
    id: 'title',
    label: 'Madad',
    render: Title,
    pose: {
      k: 0.9,
      drops: [
        [4.5, 0.4, 0, 2.3],
        [6.7, -2.0, 0.8, 0.5],
      ],
    },
    notes:
      'Madad means help. Three of us propose an offline study tool built around two models we train ourselves.',
  },
  {
    id: 'state-of-art',
    label: 'State of the art',
    render: StateOfArt,
    pose: {
      k: 0.9,
      drops: [
        [5.3, 2.4, 0, 0.85],
        [6.9, 1.1, 0.4, 0.32],
      ],
    },
    notes:
      'Four families lead today: AI tutors, grounded answers built on retrieval-augmented generation, spaced repetition with FSRS, and local AI on open models.',
  },
  {
    id: 'gaps',
    label: 'Gaps',
    render: Gaps,
    pose: {
      k: 0.9,
      drops: [[6.2, 3.0, 0, 0.6]],
    },
    notes:
      'Each tool covers part of the job. Nothing sorts files, verifies citations and tracks weak topics together, offline. Gao et al. show cited answers are often not fully supported.',
  },
  {
    id: 'idea',
    label: 'What is new',
    render: Idea,
    pose: {
      k: 0.9,
      drops: [[6.3, -2.7, 0, 0.55]],
    },
    notes:
      'The loop: organize, ask, practice, and know what to study next. The two new models power the first two steps and write the quiz questions.',
  },
  {
    id: 'organizer',
    label: 'Organizer',
    render: Organizer,
    pose: {
      k: 0.9,
      drops: [[6.7, 3.35, 0, 0.42]],
    },
    notes:
      'It reads content, not file names. It previews first, asks when unsure, and every move can be rolled back.',
  },
  {
    id: 'tutor',
    label: 'Tutor',
    render: Tutor,
    pose: {
      k: 0.9,
      drops: [[6.7, 3.35, 0, 0.42]],
    },
    notes:
      'Search first, then answer. Citations come from the real passages. If nothing relevant is found, the model is never called.',
  },
  {
    id: 'scratch',
    label: 'From scratch',
    render: Scratch,
    pose: {
      k: 0.9,
      drops: [[7.0, -3.3, 0, 0.32]],
    },
    notes:
      'From scratch means random starting weights and our own tokenizer. PyTorch gives us the maths; every weight is ours.',
  },
  {
    id: 'fit',
    label: 'How it fits',
    render: Fit,
    pose: {
      k: 0.9,
      drops: [[6.2, 3.0, 0, 0.6]],
    },
    notes:
      'The Organizer runs before reading, the Tutor after search. The existing Brain and C++ Engine do not change.',
  },
  {
    id: 'plan',
    label: 'Plan',
    render: Plan,
    pose: {
      k: 0.9,
      drops: [[6.8, 3.1, 0, 0.5]],
    },
    notes:
      'Six steps from data to testing. Success is judged on files and questions the models have never seen.',
  },
  {
    id: 'close',
    label: 'Thank you',
    render: Close,
    pose: {
      k: 0.9,
      drops: [[0, 2.55, -0.6, 1.15]],
    },
    notes: 'Private, grounded, organized, and built from scratch. Thank you.',
  },
]
