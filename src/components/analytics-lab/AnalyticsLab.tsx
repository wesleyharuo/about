"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight, ExternalLink, Github } from "lucide-react";
import { visualizations, profile } from "@/lib/data";
import type { Visualization } from "@/lib/types";
import { isPublished, platformLabel, tableauProfileUrl } from "@/lib/viz";
import { cn } from "@/lib/utils";
import { Reveal, SectionHeader } from "@/components/ui/primitives";
import { VizEmbed } from "@/components/viz/VizEmbed";

const TABS = [
  { id: "tableau", label: "Tableau", dot: "bg-signal" },
  { id: "prototype", label: "Interactive apps", dot: "bg-synapse" },
  { id: "powerbi", label: "Power BI", dot: "bg-ledger" },
] as const;

export function AnalyticsLab() {
  const [tab, setTab] = useState<Visualization["platform"]>("tableau");
  const list = visualizations.filter((v) => v.platform === tab);
  const [activeId, setActiveId] = useState<string>(list[0].id);
  const active = visualizations.find((v) => v.id === activeId && v.platform === tab) ?? list[0];

  return (
    <section id="lab" className="section scroll-mt-16">
      <div className="container">
        <SectionHeader
          index="05"
          eyebrow="Analytics lab"
          title={<>Don&apos;t read about the dashboards. <span className="text-gradient">Use them.</span></>}
          lede="A five-dashboard Tableau finance suite, live Tableau Public workbooks, the Statistics Canada Power BI series and four working command-center apps. Live embeds load only when you press play."
        />

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-xl border border-line bg-ink-2 p-1" role="tablist">
            {TABS.map((t) => {
              const n = visualizations.filter((v) => v.platform === t.id).length;
              return (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => { setTab(t.id); setActiveId(visualizations.find((v) => v.platform === t.id)!.id); }}
                  className={cn("relative rounded-lg px-4 py-2 text-sm transition", tab === t.id ? "text-fg" : "text-fg-muted hover:text-fg")}
                >
                  {tab === t.id && <motion.span layoutId="labTab" className="absolute inset-0 rounded-lg bg-ink-3" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                  <span className="relative flex items-center gap-2"><i className={cn("h-1.5 w-1.5 rounded-full", t.dot)} />{t.label} <span className="font-mono text-[11px] text-fg-faint">{n}</span></span>
                </button>
              );
            })}
          </div>
          <Link href="/dashboard/" className="btn-ghost !py-2 text-sm">Full gallery <ArrowRight className="h-4 w-4" /></Link>
        </div>

        <Reveal>
          <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
            <ul className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
              {list.map((v) => (
                <li key={v.id} className="shrink-0 lg:shrink">
                  <button
                    onClick={() => setActiveId(v.id)}
                    className={cn("w-64 rounded-xl border p-4 text-left transition lg:w-full", v.id === active.id ? "border-signal/50 bg-ink-3" : "border-line bg-ink-2 hover:border-line hover:bg-ink-3/60")}
                  >
                    <p className="eyebrow !text-[10px]">{v.domain}</p>
                    <p className="mt-1 font-medium leading-snug">{v.title}</p>
                  </button>
                </li>
              ))}
            </ul>

            <div className="panel p-3 md:p-4">
              <AnimatePresence mode="wait">
                <motion.div key={active.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  <VizEmbed viz={active} />
                  <div className="flex flex-col gap-3 px-1 pt-4 md:flex-row md:items-start md:justify-between">
                    <div className="max-w-2xl">
                      <p className="eyebrow">{platformLabel[active.platform]} · {active.domain}</p>
                      <h3 className="mt-1 font-display text-xl font-semibold">{active.title}</h3>
                      <p className="mt-1 text-sm text-fg-muted">{active.description}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      {active.platform === "tableau" && isPublished(active) && (
                        <a href={tableauProfileUrl(active)} target="_blank" rel="noreferrer" className="btn-ghost !py-2 text-sm">Tableau Public <ExternalLink className="h-3.5 w-3.5" /></a>
                      )}
                      {active.platform === "prototype" && active.repo && (
                        <a href={active.repo} target="_blank" rel="noreferrer" className="btn-ghost !py-2 text-sm"><Github className="h-4 w-4" /> Repo</a>
                      )}
                      {active.platform === "powerbi" && (
                        <a href={profile.contact.github} target="_blank" rel="noreferrer" className="btn-ghost !py-2 text-sm"><Github className="h-4 w-4" /> .pbip</a>
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
