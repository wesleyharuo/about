import { certifications, experience, projects, skills, visualizations, publications } from "./data";
import { getTimeline, toDate } from "./timeline";

// Every number on the "Personal Analytics" and "Executive Dashboard"
// sections is computed here from the data files, never typed by hand.

export function repoLanguages() {
  const counts = new Map<string, number>();
  for (const p of projects) {
    const k = p.language ?? "Docs / Other";
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function projectCategories() {
  const label: Record<string, string> = {
    finance: "Finance",
    analytics: "Analytics",
    ml: "Machine learning",
    engineering: "Data engineering",
    apps: "Apps & web",
  };
  const counts = new Map<string, number>();
  for (const p of projects) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
  return [...counts.entries()].map(([k, v]) => ({ name: label[k] ?? k, key: k, value: v })).sort((a, b) => b.value - a.value);
}

/** Cumulative earned certifications per year + per-year counts. */
export function certsByYear() {
  const earned = certifications.filter((c) => c.status === "earned");
  const years = [...new Set(earned.map((c) => Number(c.date.slice(0, 4))))].sort();
  let cum = 0;
  return years.map((y) => {
    const n = earned.filter((c) => Number(c.date.slice(0, 4)) === y).length;
    cum += n;
    return { year: String(y), added: n, total: cum };
  });
}

/** Months spent in each era of the career (overlaps counted once per role). */
export function monthsByEra() {
  const map = new Map<string, number>();
  for (const t of getTimeline()) map.set(t.era, (map.get(t.era) ?? 0) + t.months);
  return [...map.entries()].map(([name, months]) => ({ name, months, years: +(months / 12).toFixed(1) }));
}

/** Toolkit growth: how many skills from skills.json were in use by each year. */
export function toolkitGrowth() {
  const out: { year: string; skills: number; finance: number; ai: number }[] = [];
  for (let y = 2006; y <= 2026; y += 2) {
    const active = skills.skills.filter((s) => s.since <= y);
    out.push({
      year: String(y),
      skills: active.length,
      finance: active.filter((s) => s.group === "finance").length,
      ai: active.filter((s) => s.group === "ai").length,
    });
  }
  return out;
}

/** Hours saved per month by the automations with before/after metrics. */
export function automationSavings() {
  return experience.flatMap((e) =>
    e.metrics
      .filter((m) => m.before !== undefined && m.after !== undefined)
      .map((m) => ({
        company: e.company.replace("The ", "").split(" ")[0],
        label: m.label,
        before: m.before!,
        after: m.after!,
        reduction: Math.round((1 - m.after! / m.before!) * 100),
      })),
  );
}

export function kpis() {
  const firstJob = getTimeline()[0];
  const years = new Date(2026, 9, 1).getFullYear() - toDate(firstJob.start).getFullYear();
  return {
    years,
    roles: experience.length,
    repos: projects.length,
    certsEarned: certifications.filter((c) => c.status === "earned").length,
    certsInProgress: certifications.filter((c) => c.status === "in-progress").length,
    certsTarget: certifications.filter((c) => c.status === "target").length,
    publications: publications.length,
    dashboards: visualizations.length,
    tableau: visualizations.filter((v) => v.platform === "tableau").length,
    powerbi: visualizations.filter((v) => v.platform === "powerbi").length,
    prototypes: visualizations.filter((v) => v.platform === "prototype").length,
    pythonShare: Math.round((projects.filter((p) => p.language === "Python").length / projects.length) * 100),
  };
}
