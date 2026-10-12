"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Github, Search, Star } from "lucide-react";
import { projects } from "@/lib/data";
import { projectCategories } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const LANG_COLOR: Record<string, string> = { Python: "bg-signal", HTML: "bg-alert", JavaScript: "bg-ledger", TypeScript: "bg-synapse", PowerShell: "bg-fg-muted" };

export function ProjectExplorer() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [onlyDocumented, setOnlyDocumented] = useState(true);
  const cats = projectCategories();

  const list = useMemo(() => {
    const needle = q.toLowerCase();
    return projects
      .filter((p) => cat === "all" || p.category === cat)
      .filter((p) => !onlyDocumented || p.description)
      .filter((p) => !needle || [p.title, p.description ?? "", p.tech.join(" "), p.language ?? ""].join(" ").toLowerCase().includes(needle))
      .sort((a, b) => Number(b.featured) - Number(a.featured) || Number(!!b.description) - Number(!!a.description));
  }, [q, cat, onlyDocumented]);

  return (
    <div className="pt-28 pb-24">
      <div className="container">
        <p className="eyebrow mb-4">Project explorer</p>
        <h1 className="h-display max-w-3xl text-balance">{projects.length} repositories. <span className="text-fg-faint">Search them like a table.</span></h1>

        <div className="mt-10 flex flex-col gap-3 md:flex-row md:items-center">
          <label className="flex flex-1 items-center gap-2 rounded-xl border border-line bg-ink-2 px-4 py-3 focus-within:border-signal/60">
            <Search className="h-4 w-4 text-fg-faint" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search: fraud, Power BI, reconciliation, Streamlit…" className="flex-1 bg-transparent text-sm outline-none placeholder:text-fg-faint" aria-label="Search projects" />
            <span className="font-mono text-xs text-fg-faint">{list.length} rows</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-fg-muted">
            <input type="checkbox" checked={onlyDocumented} onChange={(e) => setOnlyDocumented(e.target.checked)} className="accent-[rgb(94_234_212)]" />
            Documented only
          </label>
        </div>

        <div className="mt-4 mb-8 flex flex-wrap gap-2">
          <button onClick={() => setCat("all")} className={cn("chip transition", cat === "all" && "border-signal/60 text-fg")}>All</button>
          {cats.map((c) => (
            <button key={c.key} onClick={() => setCat(c.key)} className={cn("chip transition", cat === c.key && "border-signal/60 text-fg")}>{c.name} <span className="text-fg-faint">{c.value}</span></button>
          ))}
        </div>

        <motion.div layout className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {list.map((p) => (
              <motion.a
                layout
                key={p.id}
                href={p.url}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={cn("panel panel-hover group flex flex-col p-5", p.featured && "border-signal/30")}
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-lg font-semibold leading-snug">{p.title}</h2>
                  <Github className="h-4 w-4 shrink-0 text-fg-faint transition group-hover:text-signal" />
                </div>
                <p className="mt-2 line-clamp-3 flex-1 text-sm text-fg-muted">{p.description ?? "Repository without a description yet."}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {p.language && (
                    <span className="flex items-center gap-1.5 font-mono text-[11px] text-fg-muted"><i className={cn("h-2 w-2 rounded-full", LANG_COLOR[p.language] ?? "bg-fg-faint")} />{p.language}</span>
                  )}
                  {p.stars > 0 && <span className="flex items-center gap-1 font-mono text-[11px] text-fg-faint"><Star className="h-3 w-3" />{p.stars}</span>}
                  {p.featured && <span className="rounded-full bg-signal/10 px-2 py-0.5 font-mono text-[10px] text-signal">featured</span>}
                  {p.tech.filter((t) => t !== p.language).slice(0, 3).map((t) => <span key={t} className="chip !py-0.5 !text-[10px]">{t}</span>)}
                </div>
              </motion.a>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
