import {
  SiApachemaven,
  SiCplusplus,
  SiCss,
  SiFastapi,
  SiFigma,
  SiFirebase,
  SiFlutter,
  SiFramer,
  SiGit,
  SiGithub,
  SiHibernate,
  SiHtml5,
  SiJavascript,
  SiMariadb,
  SiMysql,
  SiNodedotjs,
  SiNpm,
  SiPostgresql,
  SiPython,
  SiReact,
  SiResend,
  SiShadcnui,
  SiSqlite,
  SiSupabase,
  SiTailwindcss,
  SiTauri,
  SiTypescript,
  SiVercel,
  SiVite,
  SiXampp,
} from 'react-icons/si'
import { FaJava, FaLinux } from 'react-icons/fa6'
import {
  BrainCircuit,
  Blocks,
  Boxes,
  Cloud,
  CloudUpload,
  Code2,
  Database,
  Layers,
  LayoutTemplate,
  Network,
  Server,
  ServerCog,
  ShieldCheck,
  Shapes,
  Table,
  Webhook,
  Workflow,
} from 'lucide-react'
import type { ComponentType, CSSProperties } from 'react'

export interface TechIconEntry {
  icon: ComponentType<{ className?: string; style?: CSSProperties; 'aria-hidden'?: boolean }>
  /** Brand hex — omitted when the mark reads as neutral or the official
   * color is too dark to survive on this site's near-black background. */
  color?: string
}

/**
 * Icon + brand color per skill/tech name. Keys must match `skill.name` and
 * project `techStack` entries exactly (content/schemas/skill.ts). Names with
 * no entry here (values, interests, free-text labels elsewhere) simply
 * render without an icon — this map only covers concrete technologies.
 */
const techIcons: Record<string, TechIconEntry> = {
  // Languages
  Python: { icon: SiPython, color: '#3776AB' },
  Java: { icon: FaJava, color: '#4A90D9' },
  'C++': { icon: SiCplusplus, color: '#00599C' },
  JavaScript: { icon: SiJavascript, color: '#F7DF1E' },
  TypeScript: { icon: SiTypescript, color: '#3178C6' },
  HTML: { icon: SiHtml5, color: '#E34F26' },
  CSS: { icon: SiCss, color: '#2F9FE0' },
  SQL: { icon: Database },

  // Frontend
  React: { icon: SiReact, color: '#61DAFB' },
  'Tailwind CSS': { icon: SiTailwindcss, color: '#06B6D4' },
  'shadcn/ui': { icon: SiShadcnui },
  'Framer Motion': { icon: SiFramer, color: '#4D7CFF' },
  Flutter: { icon: SiFlutter, color: '#44D1FD' },
  Tauri: { icon: SiTauri, color: '#FFC131' },
  JavaFX: { icon: FaJava, color: '#4A90D9' },
  'Java Swing': { icon: FaJava, color: '#4A90D9' },

  // Backend
  'Node.js': { icon: SiNodedotjs, color: '#5FA04E' },
  FastAPI: { icon: SiFastapi, color: '#05998B' },
  'REST APIs': { icon: Webhook },
  Supabase: { icon: SiSupabase, color: '#3ECF8E' },
  'Supabase Auth': { icon: SiSupabase, color: '#3ECF8E' },
  Hibernate: { icon: SiHibernate, color: '#94A3AC' },

  // Database
  PostgreSQL: { icon: SiPostgresql, color: '#6E9BF2' },
  MySQL: { icon: SiMysql, color: '#5D9AC7' },
  MariaDB: { icon: SiMariadb, color: '#C0765A' },
  SQLite: { icon: SiSqlite, color: '#4A90D9' },
  Firebase: { icon: SiFirebase, color: '#FFCA28' },

  // Tools
  Git: { icon: SiGit, color: '#F05032' },
  GitHub: { icon: SiGithub },
  Vercel: { icon: SiVercel },
  'VS Code': { icon: Code2 },
  Figma: { icon: SiFigma, color: '#F24E1E' },
  Vite: { icon: SiVite, color: '#8B93FF' },
  npm: { icon: SiNpm, color: '#E0524F' },
  Resend: { icon: SiResend },
  Linux: { icon: FaLinux, color: '#FCC624' },
  Maven: { icon: SiApachemaven, color: '#E0546E' },
  XAMPP: { icon: SiXampp, color: '#FB7A24' },

  // Software engineering concepts
  'Object Oriented Programming': { icon: Boxes },
  'Database Design': { icon: Layers },
  'Database Normalization': { icon: Table },
  'Authentication & Authorization': { icon: ShieldCheck },
  'RESTful API Design': { icon: Webhook },
  'MVC Architecture': { icon: LayoutTemplate },
  'Service Oriented Architecture': { icon: Network },
  ORM: { icon: Database },
  'Client Server Applications': { icon: Server },

  // Currently learning
  'System Design': { icon: Workflow },
  'Distributed Systems': { icon: Network },
  'Cloud Computing': { icon: Cloud },
  'Cloud Deployment': { icon: CloudUpload },
  'Software Architecture': { icon: Blocks },
  'Design Patterns': { icon: Shapes },
  'Advanced React': { icon: SiReact, color: '#61DAFB' },
  'Backend Engineering': { icon: ServerCog },
  'Artificial Intelligence': { icon: BrainCircuit },
}

export function getTechIcon(name: string): TechIconEntry | undefined {
  return techIcons[name]
}
