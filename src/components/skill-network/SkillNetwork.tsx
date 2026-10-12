"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { buildSkillGraph } from "@/lib/graph";
import { skills } from "@/lib/data";
import { accentBg, accentRgb, cn } from "@/lib/utils";
import { Reveal, SectionHeader } from "@/components/ui/primitives";

export function SkillNetwork() {
  const graph = useMemo(() => buildSkillGraph(1240, 680), []);
  const [hover, setHover] = useState<string | null>(null);
  const [selected, setSelected] = useState<string>("reconciliation");
  const [group, setGroup] = useState<string | null>(null);

  const focus = hover ?? selected;
  const pos = useMemo(() => new Map(graph.nodes.map((n) => [n.id, n])), [graph]);

  const neighbours = useMemo(() => {
    const set = new Set<string>([focus]);
    for (const e of graph.edges) {
      if (e.source === focus) set.add(e.target);
      if (e.target === focus) set.add(e.source);
    }
    return set;
  }, [focus, graph.edges]);

  const skill = skills.skills.find((s) => s.id === selected) ?? skills.skills[0];
  const groupOf = (id: string) => skills.skills.find((s) => s.id === id)?.group;

  const dim = (id: string) => {
    if (group && !id.startsWith("ev:") && id !== "core" && groupOf(id) !== group) return true;
    return focus && !neighbours.has(id);
  };

  return (
    <section id="skills" className="section scroll-mt-16">
      <div className="container">
        <SectionHeader
          index="03"
          eyebrow="Interactive skill network"
          title={<>Every skill is wired to <span className="text-gradient">where it was proven.</span></>}
          lede="Inner nodes are skills, sized by depth. Outer nodes are the jobs and projects that evidence them. Hover to trace a connection, click to pin it."
        />

        <div className="mb-5 flex flex-wrap gap-2">
          <button onClick={() => setGroup(null)} className={cn("chip transition", !group && "border-signal/60 text-fg")}>All</button>
          {skills.groups.map((g) => (
            <button key={g.id} onClick={() => setGroup(group === g.id ? null : g.id)} className={cn("chip transition", group === g.id && "border-signal/60 text-fg")}>
              <span className={cn("h-1.5 w-1.5 rounded-full", accentBg[g.color])} /> {g.label}
            </button>
          ))}
        </div>

        <Reveal>
          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="panel relative overflow-hidden">
              <svg viewBox={`0 0 ${graph.width} ${graph.height}`} className="h-auto w-full" role="img" aria-label="Network of skills connected to the roles and projects that evidence them">
                <defs>
                  <radialGradient id="coreGlow">
                    <stop offset="0%" stopColor="rgb(94 234 212)" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="rgb(94 234 212)" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <circle cx={graph.width / 2} cy={graph.height / 2} r={90} fill="url(#coreGlow)" />
                <g>
                  {graph.edges.map((e, i) => {
                    const a = pos.get(e.source)!;
                    const b = pos.get(e.target)!;
                    const lit = neighbours.has(e.source) && neighbours.has(e.target) && (e.source === focus || e.target === focus);
                    return (
                      <line
                        key={i}
                        x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                        stroke={lit ? accentRgb[(pos.get(focus)?.color ?? "signal")] : "rgb(36 44 58)"}
                        strokeOpacity={lit ? 0.9 : e.source === "core" ? 0.35 : 0.5}
                        strokeWidth={lit ? 1.6 : 0.8}
                        style={{ transition: "stroke 200ms, stroke-opacity 200ms" }}
                      />
                    );
                  })}
                </g>
                <g>
                  {graph.nodes.map((n) => {
                    const faded = dim(n.id);
                    const isSkill = n.kind === "skill";
                    return (
                      <g
                        key={n.id}
                        transform={`translate(${n.x} ${n.y})`}
                        className={cn(isSkill && "cursor-pointer")}
                        onMouseEnter={() => setHover(n.id)}
                        onMouseLeave={() => setHover(null)}
                        onClick={() => isSkill && setSelected(n.id)}
                        style={{ opacity: faded ? 0.18 : 1, transition: "opacity 250ms" }}
                        tabIndex={isSkill ? 0 : -1}
                        onKeyDown={(e) => { if (isSkill && (e.key === "Enter" || e.key === " ")) setSelected(n.id); }}
                        onFocus={() => setHover(n.id)}
                        onBlur={() => setHover(null)}
                        role={isSkill ? "button" : undefined}
                        aria-label={isSkill ? n.label : undefined}
                      >
                        {n.kind === "core" ? (
                          <>
                            <circle r={n.r} fill="rgb(7 9 13)" stroke="rgb(94 234 212)" strokeWidth={1.5} />
                            <text textAnchor="middle" dy="0.35em" className="fill-signal font-mono text-[12px] font-semibold">WK</text>
                          </>
                        ) : (
                          <>
                            <motion.circle
                              r={n.r}
                              fill={n.kind === "evidence" ? "rgb(20 26 36)" : accentRgb[n.color]}
                              stroke={n.kind === "evidence" ? "rgb(92 104 124)" : "none"}
                              initial={{ scale: 0 }}
                              whileInView={{ scale: 1 }}
                              viewport={{ once: true }}
                              transition={{ type: "spring", stiffness: 200, damping: 16, delay: (n.x % 37) / 60 }}
                            />
                            {n.id === selected && <circle r={n.r + 5} fill="none" stroke={accentRgb[n.color]} strokeOpacity={0.6} />}
                            <text
                              x={n.anchor === "middle" ? 0 : (n.anchor === "start" ? 1 : -1) * (n.r + 6)}
                              y={n.anchor === "middle" ? (n.y < graph.height / 2 ? -(n.r + 8) : n.r + 14) : 0}
                              dy={n.anchor === "middle" ? 0 : "0.35em"}
                              textAnchor={n.anchor}
                              className={cn("pointer-events-none select-none", n.kind === "evidence" ? "fill-fg-faint text-[12px]" : "fill-fg text-[14px] font-medium")}
                            >
                              {n.label}
                            </text>
                          </>
                        )}
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>

            <aside className="panel p-5" aria-live="polite">
              <p className="eyebrow">Selected skill</p>
              <h3 className="mt-2 font-display text-2xl font-semibold">{skill.label}</h3>
              <p className="mt-1 font-mono text-xs text-fg-faint">in use since {skill.since} · {2026 - skill.since} yrs</p>
              <div className="mt-5">
                <div className="mb-1 flex justify-between text-xs text-fg-muted"><span>Depth</span><span className="font-mono">{skill.level}/100</span></div>
                <div className="h-1.5 overflow-hidden rounded-full bg-ink-3">
                  <motion.div key={skill.id} className="h-full rounded-full bg-gradient-to-r from-signal to-synapse" initial={{ width: 0 }} animate={{ width: `${skill.level}%` }} transition={{ duration: 0.8 }} />
                </div>
              </div>
              <p className="eyebrow mt-6 mb-3">Evidence · {skill.evidence.length}</p>
              <ul className="space-y-2">
                {skill.evidence.map((ev) => (
                  <li key={ev} className="flex items-center gap-2 rounded-lg border border-line bg-ink/50 px-3 py-2 text-sm">
                    <span className="text-signal">✓</span> {skills.evidenceLabels[ev] ?? ev}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs leading-relaxed text-fg-faint">Depth is a self-assessment; the evidence list is the part you can check.</p>
            </aside>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
