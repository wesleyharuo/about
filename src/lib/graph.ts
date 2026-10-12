import { skills } from "./data";
import type { Accent } from "./types";

export interface GraphNode {
  id: string;
  label: string;
  kind: "skill" | "evidence" | "core";
  group?: string;
  color: Accent;
  r: number;
  x: number;
  y: number;
  /** label side, so text always points away from the centre */
  anchor: "start" | "end" | "middle";
}
export interface GraphEdge {
  source: string;
  target: string;
}

/**
 * Builds the skill network as a two-ring radial layout:
 *  - centre: Wesley
 *  - inner ring: skills, grouped by family so colours cluster
 *  - outer ring: evidence (jobs, projects), each placed at the circular
 *    mean angle of the skills it proves, then spaced to avoid overlaps.
 * Fully deterministic, so server render and hydration match.
 */
export function buildSkillGraph(width = 1000, height = 640) {
  const cx = width / 2;
  const cy = height / 2;
  const groupColor = Object.fromEntries(skills.groups.map((g) => [g.id, g.color]));
  const groupOrder = skills.groups.map((g) => g.id);
  const nodes: GraphNode[] = [{ id: "core", label: "Wesley", kind: "core", color: "signal", r: 26, x: cx, y: cy, anchor: "middle" }];
  const edges: GraphEdge[] = [];

  const inner = { rx: 255, ry: 195 };
  const outer = { rx: 425, ry: 300 };

  const ordered = [...skills.skills].sort((a, b) => groupOrder.indexOf(a.group) - groupOrder.indexOf(b.group) || b.level - a.level);
  const angleOf = new Map<string, number>();
  ordered.forEach((s, i) => {
    const a = -Math.PI / 2 + (i / ordered.length) * Math.PI * 2;
    angleOf.set(s.id, a);
    const x = cx + Math.cos(a) * inner.rx;
    nodes.push({
      id: s.id,
      label: s.label,
      kind: "skill",
      group: s.group,
      color: groupColor[s.group] ?? "signal",
      r: 4 + (s.level / 100) * 8,
      x,
      y: cy + Math.sin(a) * inner.ry,
      anchor: Math.abs(x - cx) < 20 ? "middle" : x > cx ? "start" : "end",
    });
    edges.push({ source: "core", target: s.id });
  });

  // Evidence: circular mean of linked skill angles.
  const evidenceIds = [...new Set(skills.skills.flatMap((s) => s.evidence))];
  const evAngles = evidenceIds.map((id) => {
    let sx = 0, sy = 0;
    for (const s of skills.skills) if (s.evidence.includes(id)) { const a = angleOf.get(s.id)!; sx += Math.cos(a); sy += Math.sin(a); }
    return { id, a: Math.atan2(sy, sx) };
  }).sort((p, q) => p.a - q.a);

  // Enforce a minimum angular gap (a few relaxation passes around the circle).
  const minGap = (Math.PI * 2) / (evAngles.length * 1.25);
  for (let pass = 0; pass < 40; pass++) {
    for (let i = 0; i < evAngles.length; i++) {
      const cur = evAngles[i];
      const next = evAngles[(i + 1) % evAngles.length];
      let gap = next.a - cur.a;
      if (i === evAngles.length - 1) gap += Math.PI * 2;
      if (gap < minGap) { const push = (minGap - gap) / 2; cur.a -= push; next.a += push; }
    }
  }

  for (const { id, a } of evAngles) {
    const x = cx + Math.cos(a) * outer.rx;
    nodes.push({
      id: `ev:${id}`,
      label: skills.evidenceLabels[id] ?? id,
      kind: "evidence",
      color: "fg",
      r: 4,
      x: Math.round(x * 10) / 10,
      y: Math.round((cy + Math.sin(a) * outer.ry) * 10) / 10,
      anchor: Math.abs(x - cx) < 60 ? "middle" : x > cx ? "start" : "end",
    });
  }
  for (const s of skills.skills) for (const ev of s.evidence) edges.push({ source: s.id, target: `ev:${ev}` });

  nodes.forEach((n) => { n.x = Math.round(n.x * 10) / 10; n.y = Math.round(n.y * 10) / 10; });
  return { nodes, edges, width, height };
}
