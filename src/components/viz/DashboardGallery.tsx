"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Github, X } from "lucide-react";
import { profile, visualizations } from "@/lib/data";
import type { Visualization } from "@/lib/types";
import { isPublished, platformLabel, tableauProfileUrl, tableauThumb } from "@/lib/viz";
import { asset, cn } from "@/lib/utils";
import { VizEmbed } from "./VizEmbed";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "powerbi", label: "Power BI" },
  { id: "tableau", label: "Tableau" },
  { id: "prototype", label: "Interactive apps" },
] as const;

const tone: Record<Visualization["platform"], string> = { powerbi: "text-ledger", tableau: "text-signal", prototype: "text-synapse" };

export function DashboardGallery() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [open, setOpen] = useState<Visualization | null>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  const list = useMemo(() => visualizations.filter((v) => filter === "all" || v.platform === filter), [filter]);

  return (
    <div className="pt-28 pb-24">
      <div className="container">
        <p className="eyebrow mb-4">Dashboard gallery</p>
        <h1 className="h-display max-w-3xl text-balance">Every public report, <span className="text-gradient">running live.</span></h1>
        <p className="mt-5 max-w-2xl text-lg text-fg-muted">
          {visualizations.length} visualizations across Power BI, Tableau Public and custom React apps. Open any card to interact with it here, or jump to the source.
        </p>

        <div className="mt-10 mb-6 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button key={f.id} onClick={() => setFilter(f.id)} className={cn("chip !px-3.5 !py-1.5 !text-xs transition", filter === f.id && "border-signal/60 bg-signal/10 text-fg")}>
              {f.label} <span className="text-fg-faint">{f.id === "all" ? visualizations.length : visualizations.filter((v) => v.platform === f.id).length}</span>
            </button>
          ))}
        </div>

        <motion.div layout className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {list.map((v) => (
              <motion.button
                layout
                key={v.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                onClick={() => setOpen(v)}
                className="panel panel-hover group overflow-hidden text-left"
              >
                <div className="relative aspect-[16/10] overflow-hidden border-b border-line bg-ink">
                  <Thumb v={v} />
                  <span className={cn("absolute left-3 top-3 rounded-full bg-ink/85 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider backdrop-blur", tone[v.platform])}>{platformLabel[v.platform]}</span>
                </div>
                <div className="p-5">
                  <p className="eyebrow !text-[10px]">{v.domain}</p>
                  <h2 className="mt-1 font-display text-lg font-semibold">{v.title}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-fg-muted">{v.description}</p>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[60] overflow-y-auto bg-ink/85 p-3 backdrop-blur-md md:p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)}>
            <motion.div role="dialog" aria-modal="true" aria-label={open.title} className="panel mx-auto max-w-6xl p-3 md:p-5" initial={{ y: 30 }} animate={{ y: 0 }} exit={{ y: 30 }} onClick={(e) => e.stopPropagation()}>
              <div className="mb-3 flex items-start justify-between gap-4 px-1">
                <div>
                  <p className={cn("eyebrow", tone[open.platform])}>{platformLabel[open.platform]} · {open.domain}</p>
                  <h2 className="mt-1 font-display text-2xl font-semibold">{open.title}</h2>
                </div>
                <div className="flex gap-2">
                  {open.platform === "tableau" && isPublished(open) && <a href={tableauProfileUrl(open)} target="_blank" rel="noreferrer" className="btn-ghost !py-2 text-sm">Tableau Public <ExternalLink className="h-3.5 w-3.5" /></a>}
                  {open.platform === "prototype" && open.repo && <a href={open.repo} target="_blank" rel="noreferrer" className="btn-ghost !py-2 text-sm"><Github className="h-4 w-4" /> Repo</a>}
                  {open.platform === "powerbi" && <a href={profile.contact.github} target="_blank" rel="noreferrer" className="btn-ghost !py-2 text-sm"><Github className="h-4 w-4" /> GitHub</a>}
                  <button onClick={() => setOpen(null)} className="btn-ghost !p-2" aria-label="Close"><X className="h-4 w-4" /></button>
                </div>
              </div>
              <VizEmbed viz={open} autoLoad className="aspect-[16/10] md:aspect-[16/9]" />
              <p className="mt-3 px-1 text-sm text-fg-muted">{open.description}</p>
              <div className="mt-3 flex flex-wrap gap-2 px-1">{open.tags.map((t) => <span key={t} className="chip">{t}</span>)}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Thumb({ v }: { v: Visualization }) {
  const [ok, setOk] = useState(true);
  const src =
    v.platform === "tableau" ? (isPublished(v) ? tableauThumb(v) : v.screenshots?.[0] ? asset(v.screenshots[0]) : null)
    : v.platform === "prototype" ? asset(v.src.replace(/Main\.dc\.html$/, "poster.png"))
    : v.screenshots[0] ? asset(v.screenshots[0]) : null;

  if (src && ok) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" loading="lazy" onError={() => setOk(false)} onLoad={(e) => { if (e.currentTarget.naturalWidth < 20) setOk(false); }} className="h-full w-full object-cover object-top opacity-80 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-100" />;
  }
  return (
    <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 gap-2 p-4 opacity-50" aria-hidden>
      {[...Array(4)].map((_, i) => <div key={i} className="rounded-md bg-ink-3" />)}
      <div className="col-span-3 row-span-2 rounded-md bg-gradient-to-tr from-ledger/15 to-signal/10" />
      <div className="row-span-2 rounded-md bg-ink-3" />
    </div>
  );
}
