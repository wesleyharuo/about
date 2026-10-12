import { certifications, experience, projects, skills, visualizations, publications } from "./data";

/**
 * A deliberately tiny SQL engine for the Command Center terminal.
 * Supports: SELECT cols|* FROM table [WHERE col (=|!=|>|<|>=|<=|LIKE) value [AND ...]]
 *           [ORDER BY col [ASC|DESC]] [LIMIT n]
 * Also: SELECT COUNT(*) FROM ... and GROUP BY col with COUNT(*).
 */

type Row = Record<string, string | number | boolean | null>;

export const TABLES: Record<string, () => Row[]> = {
  projects: () => projects.map((p) => ({ title: p.title, language: p.language, category: p.category, stars: p.stars, featured: p.featured, url: p.url })),
  experience: () => experience.map((e) => ({ company: e.company, role: e.role, start: e.start, end: e.end ?? "present", location: e.location, era: e.era })),
  certifications: () => certifications.map((c) => ({ name: c.name, issuer: c.issuer, date: c.date, track: c.track, status: c.status })),
  skills: () => skills.skills.map((s) => ({ skill: s.label, grp: s.group, level: s.level, since: s.since, evidence: s.evidence.length })),
  dashboards: () => visualizations.map((v) => ({ title: v.title, platform: v.platform, domain: v.domain })),
  publications: () => publications.map((p) => ({ title: p.title, type: p.type, date: p.date })),
};

export interface SqlResult { columns: string[]; rows: Row[]; ms: number }

const unquote = (v: string) => v.trim().replace(/^['"]|['"]$/g, "");

function cmp(a: unknown, op: string, raw: string) {
  const b = unquote(raw);
  const num = Number(b);
  const isNum = !Number.isNaN(num) && typeof a === "number";
  const av = isNum ? (a as number) : String(a ?? "").toLowerCase();
  const bv = isNum ? num : b.toLowerCase();
  switch (op) {
    case "=": return av === bv;
    case "!=": case "<>": return av !== bv;
    case ">": return av > bv;
    case "<": return av < bv;
    case ">=": return av >= bv;
    case "<=": return av <= bv;
    case "like": {
      const re = new RegExp("^" + String(bv).replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/%/g, ".*").replace(/_/g, ".") + "$", "i");
      return re.test(String(a ?? ""));
    }
  }
  return false;
}

export function runSql(input: string): SqlResult {
  const t0 = performance.now();
  const q = input.trim().replace(/;$/, "");
  const m = q.match(/^select\s+(.+?)\s+from\s+(\w+)(?:\s+where\s+(.+?))?(?:\s+group\s+by\s+(\w+))?(?:\s+order\s+by\s+(\w+)(?:\s+(asc|desc))?)?(?:\s+limit\s+(\d+))?$/i);
  if (!m) throw new Error("Syntax: SELECT cols FROM table [WHERE ...] [GROUP BY col] [ORDER BY col DESC] [LIMIT n]");
  const [, colsRaw, table, where, groupBy, orderBy, dir, limit] = m;
  const src = TABLES[table.toLowerCase()];
  if (!src) throw new Error(`Unknown table "${table}". Tables: ${Object.keys(TABLES).join(", ")}`);
  let rows = src();

  if (where) {
    const conds = where.split(/\s+and\s+/i).map((c) => {
      const cm = c.match(/^(\w+)\s*(=|!=|<>|>=|<=|>|<|like)\s*(.+)$/i);
      if (!cm) throw new Error(`Can't parse condition: ${c}`);
      return { col: cm[1], op: cm[2].toLowerCase(), val: cm[3] };
    });
    rows = rows.filter((r) => conds.every((c) => cmp(r[c.col], c.op, c.val)));
  }

  const isCount = /count\(\*\)/i.test(colsRaw);
  if (groupBy) {
    const g = new Map<string, number>();
    for (const r of rows) { const key = String(r[groupBy] ?? "null"); g.set(key, (g.get(key) ?? 0) + 1); }
    rows = [...g.entries()].map(([key, n]) => ({ [groupBy]: key, count: n }));
  } else if (isCount) {
    rows = [{ count: rows.length }];
  }

  if (orderBy) {
    const d = dir?.toLowerCase() === "desc" ? -1 : 1;
    rows = [...rows].sort((a, b) => {
      const x = a[orderBy] ?? "", y = b[orderBy] ?? "";
      return (typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y))) * d;
    });
  }
  if (limit) rows = rows.slice(0, Number(limit));

  let columns: string[];
  if (groupBy) columns = [groupBy, "count"];
  else if (isCount) columns = ["count"];
  else if (colsRaw.trim() === "*") columns = Object.keys(src()[0] ?? {});
  else columns = colsRaw.split(",").map((c) => c.trim());

  return { columns, rows: rows.map((r) => Object.fromEntries(columns.map((c) => [c, r[c] ?? null]))), ms: Math.max(0.1, +(performance.now() - t0).toFixed(1)) };
}
