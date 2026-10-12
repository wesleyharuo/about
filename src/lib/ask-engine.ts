import { certifications, experience, profile, projects, publications, skills, visualizations } from "./data";
import { formatMonth } from "./utils";

/**
 * Ask Wesley AI — a retrieval engine that runs entirely in the browser.
 *
 * Every answer is assembled from the JSON data files, with sources, so it
 * never states a fact that isn't in /src/data. No server, no API key.
 */

export interface AskSource { label: string; href: string }
export interface AskAnswer { text: string; bullets: string[]; sources: AskSource[]; intent: string }

interface Doc { id: string; title: string; text: string; href: string; kind: string }

const SYNONYMS: Record<string, string[]> = {
  powerbi: ["power", "bi", "dax", "powerquery", "pbi", "pbip", "dashboard", "dashboards", "report"],
  sql: ["sql", "query", "queries", "stored", "procedures", "database", "databases", "informix", "snowflake", "dbt"],
  python: ["python", "pandas", "numpy", "streamlit", "script"],
  tableau: ["tableau", "viz", "vizzes"],
  finance: ["finance", "financial", "fp&a", "fpa", "budget", "variance", "ledger", "gl", "reconciliation", "reconcile", "close", "accounting", "ifrs"],
  ai: ["ai", "llm", "llms", "genai", "machine", "learning", "ml", "model", "models", "agent", "agents", "prompt"],
  fraud: ["fraud", "anomaly", "anomalies", "duplicate", "claims", "risk"],
  cert: ["cert", "certs", "certification", "certifications", "certificate", "roadmap", "learning", "courses"],
};

const STOP = new Set("a an the of and or to in on for with about me tell show is are was what how does do wesley wesley's his he her can you please i".split(" "));

function tokens(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9&+ ]/g, " ").split(/\s+/).filter((t) => t && !STOP.has(t));
}

function expand(q: string[]) {
  const out = new Set(q);
  for (const t of q) for (const [k, list] of Object.entries(SYNONYMS)) if (k === t || list.includes(t)) { out.add(k); list.forEach((x) => out.add(x)); }
  return [...out];
}

let DOCS: Doc[] | null = null;
function docs(): Doc[] {
  if (DOCS) return DOCS;
  DOCS = [
    ...experience.map((e) => ({
      id: e.id, kind: "experience", href: "/#timeline",
      title: `${e.role} · ${e.company}`,
      text: [e.context, ...e.highlights, e.skills.join(" ")].join(" "),
    })),
    ...projects.map((p) => ({
      id: p.id, kind: "project", href: p.url,
      title: p.title,
      text: [p.description ?? "", p.tech.join(" "), p.language ?? "", p.category].join(" "),
    })),
    ...certifications.map((c) => ({
      id: c.id, kind: "cert", href: "/#certifications",
      title: `${c.name} — ${c.issuer}`,
      text: `${c.name} ${c.issuer} ${c.track} certification ${c.status}`,
    })),
    ...publications.map((p) => ({ id: p.id, kind: "publication", href: p.url, title: p.title, text: `${p.type} ${p.summary} research publication ai security` })),
    ...visualizations.map((v) => ({
      id: v.id, kind: "viz", href: "/dashboard/",
      title: v.title,
      text: `${v.description} ${v.tags.join(" ")} ${v.platform} dashboard`,
    })),
  ];
  return DOCS;
}

function search(q: string, kinds?: string[], k = 5) {
  const terms = expand(tokens(q));
  const scored = docs()
    .filter((d) => !kinds || kinds.includes(d.kind))
    .map((d) => {
      const title = d.title.toLowerCase();
      const body = d.text.toLowerCase();
      let s = 0;
      for (const t of terms) {
        if (t.length < 2) continue;
        if (title.includes(t)) s += 3;
        const hits = body.split(t).length - 1;
        s += Math.min(hits, 4);
      }
      return { d, s };
    })
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s);
  return scored.slice(0, k).map((x) => x.d);
}

const has = (q: string, ...words: string[]) => words.some((w) => q.includes(w));

export function ask(question: string): AskAnswer {
  const q = question.toLowerCase();

  if (has(q, "power bi", "powerbi", "dax", "power query")) {
    const roles = experience.filter((e) => e.skills.some((s) => /power bi|dax|power query/i.test(s)));
    return {
      intent: "powerbi",
      text: `Power BI has been Wesley's main reporting tool since 2016 — across ${roles.length} roles in two countries. The pattern is always the same: model the data and validate it first, then build the report people actually run the business on.`,
      bullets: [
        ...roles.map((r) => `${r.company}: ${r.highlights.find((h) => /power bi/i.test(h)) ?? r.highlights[0]}`),
        `Public work: a ${visualizations.filter((v) => v.platform === "powerbi").length}-report Statistics Canada series (Housing, Demographic Shock, GTA Expansion, Ops Efficiency) built as .pbip projects with auto-refresh.`,
      ],
      sources: [{ label: "Career timeline", href: "/#timeline" }, { label: "Dashboard gallery", href: "/dashboard/" }],
    };
  }

  if (has(q, "sql")) {
    const repos = projects.filter((p) => p.tech.some((t) => /sql|dbt|snowflake/i.test(t)));
    return {
      intent: "sql",
      text: "SQL is the thread through the whole career — it started in production databases in 2006, long before the dashboards.",
      bullets: [
        "Dasa (2006–2014): complex queries and stored procedures over clinical and financial transactions; ETL for ~80 lab go-lives.",
        "Postal Saúde: SQL anomaly checks that flagged duplicate claims, billing anomalies and provider overcharging.",
        "Humberview & CNP: SQL validation routines that removed manual checks from month-end close.",
        ...repos.map((r) => `GitHub · ${r.title}${r.description ? ` — ${r.description}` : ""}`),
      ],
      sources: repos.map((r) => ({ label: r.title, href: r.url })),
    };
  }

  if (has(q, "certif", "roadmap", "course", "learning")) {
    const earned = certifications.filter((c) => c.status === "earned");
    const next = certifications.filter((c) => c.status !== "earned");
    return {
      intent: "certifications",
      text: `${earned.length} certifications earned, most of them since 2025 — heavy on Databricks, AI and analytics. The most recent: ${earned[0].name} (${earned[0].issuer}, ${formatMonth(earned[0].date)}).`,
      bullets: [
        ...earned.slice(0, 5).map((c) => `✓ ${c.name} — ${c.issuer}, ${formatMonth(c.date, c.dateApprox)}`),
        ...next.map((c) => `${c.status === "in-progress" ? "◐ In progress" : "○ Next"}: ${c.name} — ${c.issuer}`),
      ],
      sources: [{ label: "Certification roadmap", href: "/#certifications" }],
    };
  }

  if (has(q, "approach", "method", "how does", "how do", "philosophy", "process", "work")) {
    return {
      intent: "approach",
      text: "The report is the last step, not the first. When a number doesn't agree, Wesley traces it back to where the record broke instead of adjusting the output.",
      bullets: [
        "Requirements — what decision will this number support, and who needs to trust it?",
        "Data model — entities, keys and the chart of accounts before any query is written.",
        "SQL & ingestion — extraction, cleaning and loading with checks at every stage.",
        "Reconciliation — every total tied back to the books or the system of record.",
        "Automation — repeatable jobs replace manual re-keying, with validation built in.",
        "Reporting — dashboards and commentary on one validated dataset.",
      ],
      sources: [{ label: "Manifesto", href: "/#manifesto" }],
    };
  }

  if (has(q, "tableau")) {
    const t = visualizations.filter((v) => v.platform === "tableau");
    return {
      intent: "tableau",
      text: `${t.length} Tableau dashboards — including a five-dashboard finance suite (P&L, cash flow, FP&A, balance sheet, working capital) for a fictional Canadian distributor — plus Tableau in the Amazon Career Choice program.`,
      bullets: t.map((v) => `${v.title} — ${v.description}`),
      sources: [{ label: "Tableau Public profile", href: profile.contact.tableau }, { label: "Dashboard gallery", href: "/dashboard/" }],
    };
  }

  if (has(q, "contact", "hire", "email", "reach", "available", "availability", "open to")) {
    return {
      intent: "contact",
      text: profile.availability,
      bullets: [`Email: ${profile.contact.email}`, `LinkedIn: ${profile.contact.linkedin}`, `GitHub: ${profile.contact.github}`, `${profile.status}, based in the ${profile.location}.`],
      sources: [{ label: "Contact hub", href: "/#contact" }],
    };
  }

  if (has(q, "research", "publication", "paper", "thesis", "security")) {
    return {
      intent: "research",
      text: `${publications.length} independent publications on AI risk — the same question he asks of a ledger, applied to AI output: can it be trusted, and how far does the damage travel when it can't?`,
      bullets: publications.map((p) => `${p.title} (${p.type}, ${p.date.slice(0, 4)})`),
      sources: [{ label: "ORCID", href: profile.contact.orcid }],
    };
  }

  if (has(q, "skill", "stack", "tools", "technolog")) {
    const top = [...skills.skills].sort((a, b) => b.level - a.level).slice(0, 8);
    return {
      intent: "skills",
      text: "Strongest where systems and finance overlap: SQL, reconciliation, data quality and Power BI.",
      bullets: top.map((s) => `${s.label} — in use since ${s.since}, evidenced at ${s.evidence.length} places`),
      sources: [{ label: "Skill network", href: "/#skills" }],
    };
  }

  // Generic retrieval fallback
  const hits = search(question);
  if (!hits.length) {
    return {
      intent: "fallback",
      text: "I couldn't find that in Wesley's data. Try asking about Power BI, SQL, fraud detection, certifications, research or how he approaches analytics.",
      bullets: [],
      sources: [],
    };
  }
  return {
    intent: "search",
    text: `Here's what I found in Wesley's work for "${question}":`,
    bullets: hits.map((d) => {
      const doc = d.text.length > 180 ? `${d.text.slice(0, 177)}…` : d.text;
      return `${d.title} — ${doc}`;
    }),
    sources: hits.filter((d) => d.href.startsWith("http")).slice(0, 3).map((d) => ({ label: d.title, href: d.href })),
  };
}

export const SUGGESTED_QUESTIONS = [
  "Tell me about Wesley's Power BI experience",
  "Show SQL projects",
  "Show certification roadmap",
  "How does Wesley approach analytics?",
  "What fraud detection work has he done?",
  "Is he open to new roles?",
];
