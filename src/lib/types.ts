// ─── Domain model ────────────────────────────────────────────────
// Every section of the site renders from these types. The JSON files
// in src/data are the single source of truth; nothing is hard-coded
// in components, so updating the site means editing data, not JSX.

export type Accent = "signal" | "synapse" | "ledger" | "alert" | "fg";

export interface Profile {
  name: string;
  shortName: string;
  title: string;
  headline: string;
  location: string;
  mission: string;
  summary: string;
  signature: string;
  availability: string;
  status: string;
  languages: { name: string; level: string }[];
  contact: {
    email: string;
    linkedin: string;
    github: string;
    orcid: string;
    tableau: string;
    resume: string;
  };
  stats: {
    careerStartYear: number;
    countries: number;
    publicRepos: number;
    certifications: number;
    publications: number;
    publicDashboards: number;
  };
  headlineImpact: { value: string; label: string; context: string }[];
}

export interface Metric {
  label: string;
  unit: string;
  value?: number;
  before?: number;
  after?: number;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  start: string; // YYYY-MM
  end: string | null;
  location: string;
  era: string;
  color: Accent;
  context: string;
  highlights: string[];
  metrics: Metric[];
  skills: string[];
}

export type ProjectCategory = "finance" | "analytics" | "ml" | "engineering" | "apps";

export interface Project {
  id: string;
  repo: string;
  title: string;
  language: string | null;
  stars: number;
  url: string;
  description: string | null;
  category: ProjectCategory;
  tech: string[];
  featured: boolean;
}

export type CertStatus = "earned" | "in-progress" | "target";

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string; // YYYY-MM
  dateApprox?: boolean;
  track: "Analytics" | "Engineering" | "AI" | "Business";
  status: CertStatus;
  credentialId?: string;
}

export interface Publication {
  id: string;
  title: string;
  type: string;
  date: string;
  summary: string;
  url: string;
}

export interface SkillGroup {
  id: string;
  label: string;
  color: Accent;
}

export interface Skill {
  id: string;
  label: string;
  group: string;
  level: number; // 0–100, self-assessed depth
  since: number;
  evidence: string[];
}

export interface SkillsData {
  groups: SkillGroup[];
  skills: Skill[];
  evidenceLabels: Record<string, string>;
}

interface VizBase {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  domain: string;
  tags: string[];
  featured: boolean;
}

export interface TableauViz extends VizBase {
  platform: "tableau";
  /** workbookRepoUrl on Tableau Public. Omit for a workbook that isn't published yet. */
  workbook?: string;
  /** sheet / dashboard name */
  view?: string;
  /** Dashboard images in /public/tableau/..., shown when there's no published workbook. */
  screenshots?: string[];
  /** Groups dashboards from the same workbook, e.g. "Borealis finance suite". */
  series?: string;
}

export interface PowerBIViz extends VizBase {
  platform: "powerbi";
  pbip: string;
  /** "Publish to web" URL (https://app.powerbi.com/view?r=...). Empty = not published yet. */
  embedUrl: string;
  /** Exported page images in /public/powerbi/<id>/..., shown when no embedUrl. */
  screenshots: string[];
}

export interface PrototypeViz extends VizBase {
  platform: "prototype";
  src: string; // path under /public
  repo?: string;
}

export type Visualization = TableauViz | PowerBIViz | PrototypeViz;
