"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionHeader } from "@/components/ui/primitives";

interface Story {
  id: string;
  kicker: string;
  title: string;
  company: string;
  metric: string;
  metricLabel: string;
  problem: string;
  action: string[];
  result: string;
  stack: string[];
  bar?: { before: number; after: number; unit: string };
  gradient: string;
}

// Business-impact stories: problem → what was done → result.
// Facts come from the résumé; keep this list in sync with experience.json.
const STORIES: Story[] = [
  {
    id: "humberview",
    kicker: "Finance automation",
    title: "Four days of compilation became a three-hour refresh",
    company: "The Humberview Group · 20 dealerships",
    metric: "−91%",
    metricLabel: "monthly compilation time (4 days → 3 h)",
    problem: "Every month, dealer management system output was re-keyed into Excel models across 20 stores and OEM account structures before anyone could review the month.",
    action: ["SQL and Python routines over DMS output", "Excel models rebuilt as Power Query workflows with validation checks", "DMS reconciled to the general ledger before publishing", "Power BI for weekly business reviews"],
    result: "Compilation dropped from 4 days to 3 hours, and 20 general managers ran their weekly reviews off the same validated numbers as head office.",
    stack: ["SQL", "Python", "Power Query", "Power BI", "DAX"],
    bar: { before: 32, after: 3, unit: "h" },
    gradient: "from-ledger/30 via-ledger/5",
  },
  {
    id: "nextlens",
    kicker: "Migration & reconciliation",
    title: "$14,500 in duplicate invoices stopped at cut-over",
    company: "NextLens Data Analytics",
    metric: "$14.5K",
    metricLabel: "caught before sign-off",
    problem: "Small businesses moving from spreadsheets to QuickBooks Online and Xero, with three years of history and figures that didn't agree between sources.",
    action: ["Chart-of-accounts crosswalks for 4,500 transactions", "Trial balance, opening balances and AR/AP tied to legacy books", "pandas de-duplication before load", "Written reconciliation sign-off"],
    result: "Duplicate supplier invoices and mis-mapped GL accounts were caught before go-live, and the owner's month-end reporting went from 5 days to 3 hours.",
    stack: ["Python", "SQL", "QuickBooks", "Xero", "Power BI"],
    bar: { before: 40, after: 3, unit: "h" },
    gradient: "from-signal/30 via-signal/5",
  },
  {
    id: "llm",
    kicker: "AI with controls",
    title: "120 invoices a month read by an LLM — and checked",
    company: "NextLens Data Analytics",
    metric: "120",
    metricLabel: "invoices / month, validated",
    problem: "Line items locked in unstructured PDF invoices were being re-typed by hand into the books.",
    action: ["Structured-prompt LLM extraction", "Every value validated against the chart of accounts", "Exceptions routed to a person, never passed silently", "Orchestrated with APIs and n8n"],
    result: "Manual re-keying replaced with an automated flow where only validated values reach the ledger and reports.",
    stack: ["LLM", "n8n", "APIs", "Python"],
    gradient: "from-synapse/30 via-synapse/5",
  },
  {
    id: "cnp",
    kicker: "FP&A visibility",
    title: "12 project squads saw their budget during the month, not after close",
    company: "CNP Assurances · digital subsidiary launch",
    metric: "12",
    metricLabel: "squads with in-period visibility",
    problem: "A new digital subsidiary was launching inside a major insurer; costs had to be split between entities and budget consumption was only visible after close.",
    action: ["Budget-vs-actual within the close cycle", "Cost separation between parent and subsidiary", "SAP FI/CO cross-validated with Cognos TM1 for IFRS 16", "Power BI and Cognos dashboards"],
    result: "Each entity got correctly allocated data and squads could act on spend while it was still happening.",
    stack: ["SAP FI/CO", "Cognos TM1", "Power BI", "SQL", "Python"],
    gradient: "from-ledger/25 via-synapse/5",
  },
  {
    id: "postal",
    kicker: "Fraud & anomaly",
    title: "SQL that protected money, not uptime",
    company: "Postal Saúde · national health plan",
    metric: "SQL",
    metricLabel: "anomaly controls on claims",
    problem: "A health plan spun out of Brazil's postal service needed fraud controls and continuous regulatory reporting from day one.",
    action: ["Anomaly checks over claims and eligibility", "Duplicate claims, billing anomalies, provider overcharging flagged", "Medical and financial data consolidated during separation", "Loss-ratio and utilization KPI dashboards"],
    result: "Suspicious claims surfaced before payment, and reporting stayed continuous through the migration to a new entity.",
    stack: ["SQL", "KPI dashboards", "Healthcare data"],
    gradient: "from-alert/30 via-alert/5",
  },
  {
    id: "dasa",
    kicker: "Systems & migration",
    title: "Three legacy platforms merged; ~80 lab units taken live",
    company: "Dasa · Brazil's largest diagnostics group",
    metric: "~80",
    metricLabel: "units taken live via ETL",
    problem: "Growth by acquisition left clinical and financial data spread across systems never designed to talk to each other.",
    action: ["ETL under clinical data-governance rules", "Three legacy platforms consolidated into one", "Stored procedures over high-volume transactions", "Production fixes at the record level"],
    result: "Every go-live proved the same thing: the numbers still matched on the other side.",
    stack: ["SQL", "Informix", "ETL", "Shell"],
    gradient: "from-synapse/30 via-signal/5",
  },
];

export function ImpactStories() {
  const rail = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<Story | null>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  const scroll = (dir: number) => rail.current?.scrollBy({ left: dir * rail.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <section id="impact" className="section scroll-mt-16">
      <div className="container">
        <div className="flex items-end justify-between gap-6">
          <SectionHeader
            index="04"
            eyebrow="Business impact stories"
            title={<>Now streaming: <span className="text-gradient">problems that got solved.</span></>}
            lede="Each title is a real engagement. Open one for the problem, the work and the result."
            className="!mb-10"
          />
          <div className="mb-12 hidden gap-2 md:flex">
            <button onClick={() => scroll(-1)} className="btn-ghost !p-2.5" aria-label="Scroll stories left"><ChevronLeft className="h-5 w-5" /></button>
            <button onClick={() => scroll(1)} className="btn-ghost !p-2.5" aria-label="Scroll stories right"><ChevronRight className="h-5 w-5" /></button>
          </div>
        </div>
      </div>

      <div ref={rail} className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-6 md:px-[max(2rem,calc((100vw_-_1240px)/2_+_2rem))]" style={{ scrollbarWidth: "none" }}>
        {STORIES.map((s, i) => (
          <motion.button
            key={s.id}
            onClick={() => setOpen(s)}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07, duration: 0.6 }}
            whileHover={{ y: -6 }}
            className="group relative flex h-[380px] w-[300px] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-2xl border border-line bg-ink-2 p-6 text-left md:w-[340px]"
          >
            <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-b to-transparent opacity-70 transition group-hover:opacity-100", s.gradient)} />
            <div className="relative">
              <p className="eyebrow">{String(i + 1).padStart(2, "0")} · {s.kicker}</p>
              <h3 className="mt-4 font-display text-2xl font-semibold leading-tight text-balance">{s.title}</h3>
            </div>
            <div className="relative">
              <p className="font-display text-5xl font-semibold tracking-tight">{s.metric}</p>
              <p className="text-sm text-fg-muted">{s.metricLabel}</p>
              <p className="mt-4 font-mono text-[11px] text-fg-faint">{s.company}</p>
              <p className="mt-4 text-xs font-medium text-signal opacity-0 transition group-hover:opacity-100">Open story →</p>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[60] grid place-items-center bg-ink/80 p-4 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)}>
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={open.title}
              className="panel relative max-h-[90vh] w-full max-w-3xl overflow-y-auto p-6 md:p-10"
              initial={{ scale: 0.94, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setOpen(null)} className="btn-ghost absolute right-4 top-4 !p-2" aria-label="Close"><X className="h-4 w-4" /></button>
              <p className="eyebrow">{open.kicker} · {open.company}</p>
              <h3 className="mt-3 font-display text-3xl font-semibold text-balance">{open.title}</h3>
              <div className="mt-8 grid gap-6 md:grid-cols-3">
                <div>
                  <p className="eyebrow mb-2 !text-alert">Problem</p>
                  <p className="text-sm leading-relaxed text-fg-muted">{open.problem}</p>
                </div>
                <div>
                  <p className="eyebrow mb-2 !text-synapse">What I did</p>
                  <ul className="space-y-1.5 text-sm text-fg-muted">{open.action.map((a) => <li key={a}>→ {a}</li>)}</ul>
                </div>
                <div>
                  <p className="eyebrow mb-2 !text-signal">Result</p>
                  <p className="text-sm leading-relaxed text-fg">{open.result}</p>
                </div>
              </div>
              {open.bar && (
                <div className="mt-8 space-y-2">
                  {(["before", "after"] as const).map((k) => (
                    <div key={k} className="flex items-center gap-3">
                      <span className="w-14 font-mono text-xs text-fg-faint">{k}</span>
                      <div className="h-3 flex-1 overflow-hidden rounded-full bg-ink-3">
                        <motion.div className={cn("h-full rounded-full", k === "before" ? "bg-fg-faint" : "bg-signal")} initial={{ width: 0 }} animate={{ width: `${(open.bar![k] / open.bar!.before) * 100}%` }} transition={{ duration: 0.9, delay: k === "after" ? 0.3 : 0 }} />
                      </div>
                      <span className="w-12 text-right font-mono text-xs">{open.bar![k]}{open.bar!.unit}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-8 flex flex-wrap gap-2">{open.stack.map((t) => <span key={t} className="chip">{t}</span>)}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
