"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { MapPin } from "lucide-react";
import { getTimeline, formatDuration } from "@/lib/timeline";
import { accentBg, accentText, cn, formatMonth } from "@/lib/utils";
import { Reveal, SectionHeader } from "@/components/ui/primitives";

const START = 2006;
const END = 2027;
const span = END - START;

export function CareerTimeline() {
  const items = getTimeline();
  const [active, setActive] = useState(items[items.length - 1].id);
  const sel = items.find((i) => i.id === active)!;
  const pct = (ym: string | null) => {
    const d = ym ? new Date(Number(ym.slice(0, 4)), Number(ym.slice(5, 7)) - 1) : new Date(2026, 9);
    return ((d.getFullYear() + d.getMonth() / 12 - START) / span) * 100;
  };

  return (
    <section id="timeline" className="section scroll-mt-16">
      <div className="container">
        <SectionHeader
          index="02"
          eyebrow="Career timeline"
          title={<>I learned the systems <span className="text-fg-faint">before</span> I learned the books.</>}
          lede="Most analysts start at the dashboard and learn what's underneath over time. This path went the other way — and that order explains how the work gets done today. Select a role."
        />

        <Reveal>
          <div className="panel p-5 md:p-8">
            {/* Gantt */}
            <div className="relative">
              <div className="relative mb-3 hidden h-5 md:block">
                {Array.from({ length: span / 2 + 1 }, (_, i) => START + i * 2).map((y) => (
                  <span key={y} className="absolute -translate-x-1/2 font-mono text-[10px] text-fg-faint" style={{ left: `${((y - START) / span) * 100}%` }}>
                    {y}
                  </span>
                ))}
              </div>
              <div className="space-y-2">
                {[...items].reverse().map((it) => {
                  const left = pct(it.start);
                  const width = Math.max(pct(it.end) - left, 2.5);
                  const on = it.id === active;
                  return (
                    <button
                      key={it.id}
                      onClick={() => setActive(it.id)}
                      className={cn("group relative block h-11 w-full rounded-lg text-left transition", on ? "bg-ink-3" : "hover:bg-ink-3/60")}
                      aria-pressed={on}
                    >
                      <span className="pointer-events-none absolute inset-y-0 left-3 z-10 flex items-center gap-2 text-xs md:hidden">
                        <span className={cn("h-2 w-2 rounded-full", accentBg[it.color])} />
                        <span className={on ? "text-fg" : "text-fg-muted"}>{it.company}</span>
                        <span className="font-mono text-fg-faint">{it.startYear}–{it.end ? it.endYear : "now"}</span>
                      </span>
                      <motion.span
                        className={cn("absolute inset-y-2 hidden items-center overflow-hidden rounded-md px-2 md:flex", accentBg[it.color], on ? "opacity-100" : "opacity-40 group-hover:opacity-70")}
                        style={{ left: `${left}%` }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${width}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                      >
                        {width > 9 && <span className="whitespace-nowrap text-[11px] font-semibold text-ink">{it.company}</span>}
                      </motion.span>
                      {width <= 9 && (
                        <span className={cn("absolute inset-y-0 hidden items-center whitespace-nowrap pr-2 text-[11px] font-semibold md:flex", on ? "text-fg" : "text-fg-muted")} style={{ right: `${100 - left}%` }}>
                          {it.company}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detail */}
            <AnimatePresence mode="wait">
              <motion.div
                key={sel.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mt-8 grid gap-8 border-t border-line pt-8 lg:grid-cols-[1fr_1.4fr]"
              >
                <div>
                  <p className={cn("eyebrow mb-2", accentText[sel.color])}>{sel.era}</p>
                  <h3 className="font-display text-2xl font-semibold">{sel.role}</h3>
                  <p className="mt-1 text-fg-muted">{sel.company}</p>
                  <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-fg-faint">
                    <span>{formatMonth(sel.start)} — {formatMonth(sel.end)}</span>
                    <span>{formatDuration(sel.months)}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{sel.location}</span>
                  </p>
                  <p className="mt-5 leading-relaxed text-fg-muted">{sel.context}</p>
                  {sel.metrics.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-3">
                      {sel.metrics.map((m) => (
                        <div key={m.label} className="rounded-xl border border-line bg-ink/60 px-4 py-3">
                          <p className={cn("font-display text-xl font-semibold", accentText[sel.color === "fg" ? "signal" : sel.color])}>
                            {m.before !== undefined ? `${m.before}h → ${m.after}h` : `${m.unit === "CAD" ? "$" : ""}${m.value?.toLocaleString("en-CA")}`}
                          </p>
                          <p className="text-xs text-fg-faint">{m.label}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <ul className="space-y-3">
                    {sel.highlights.map((h, i) => (
                      <motion.li key={i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="flex gap-3 leading-relaxed">
                        <span className={cn("mt-2 h-1.5 w-1.5 shrink-0 rounded-full", accentBg[sel.color])} />
                        <span className="text-fg/90">{h}</span>
                      </motion.li>
                    ))}
                  </ul>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {sel.skills.map((s) => <span key={s} className="chip">{s}</span>)}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
