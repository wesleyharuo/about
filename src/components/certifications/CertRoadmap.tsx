"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { certifications } from "@/lib/data";
import type { Certification } from "@/lib/types";
import { cn, formatMonth } from "@/lib/utils";
import { Reveal, SectionHeader } from "@/components/ui/primitives";

const TRACKS: { id: Certification["track"]; color: string; ring: string; text: string }[] = [
  { id: "Analytics", color: "bg-signal", ring: "border-signal", text: "text-signal" },
  { id: "Engineering", color: "bg-synapse", ring: "border-synapse", text: "text-synapse" },
  { id: "AI", color: "bg-alert", ring: "border-alert", text: "text-alert" },
  { id: "Business", color: "bg-ledger", ring: "border-ledger", text: "text-ledger" },
];
const Y0 = 2023;
const Y1 = 2027.75;
const x = (d: string) => ((Number(d.slice(0, 4)) + (Number(d.slice(5, 7)) - 1) / 12 - Y0) / (Y1 - Y0)) * 100;

export function CertRoadmap() {
  const [hover, setHover] = useState<Certification | null>(null);
  const today = x("2026-10");
  const earned = certifications.filter((c) => c.status === "earned").length;
  const shown = hover ?? certifications[0];

  return (
    <section id="certifications" className="section scroll-mt-16">
      <div className="container">
        <SectionHeader
          index="06"
          eyebrow="Certification roadmap"
          title={<>{earned} earned. <span className="text-fg-faint">The next ones are on the map.</span></>}
          lede="Four tracks, one direction: from analytics into engineering and AI, anchored by an accounting diploma. Filled = earned, half = in progress, outlined = next target."
        />

        <Reveal>
          <div className="panel p-5 md:p-8">
            {/* Desktop roadmap */}
            <div className="relative hidden md:block">
              <div className="relative ml-28 h-6">
                {[2023, 2024, 2025, 2026, 2027].map((y) => (
                  <span key={y} className="absolute -translate-x-1/2 font-mono text-[11px] text-fg-faint" style={{ left: `${x(`${y}-01`)}%` }}>{y}</span>
                ))}
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 ml-28" style={{ left: 0, right: 0 }}>
                  <div className="absolute inset-y-0 border-l border-dashed border-signal/50" style={{ left: `${today}%` }}>
                    <span className="absolute -top-1 left-1.5 rounded bg-signal/15 px-1.5 font-mono text-[10px] text-signal">today</span>
                  </div>
                </div>
                {TRACKS.map((t) => (
                  <div key={t.id} className="flex h-20 items-center border-t border-line/60">
                    <span className="w-28 shrink-0 text-sm text-fg-muted">{t.id}</span>
                    <div className="relative h-full flex-1">
                      <div className="absolute inset-x-0 top-1/2 h-px bg-line" />
                      {certifications.filter((c) => c.track === t.id).map((c, i) => (
                        <motion.button
                          key={c.id}
                          onMouseEnter={() => setHover(c)}
                          onFocus={() => setHover(c)}
                          initial={{ scale: 0, opacity: 0 }}
                          whileInView={{ scale: 1, opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.05 * i, type: "spring", stiffness: 260, damping: 18 }}
                          className={cn(
                            "absolute top-1/2 h-4 w-4 rounded-full border-2 transition-transform hover:scale-150",
                            t.ring,
                            c.status === "earned" && t.color,
                            c.status === "in-progress" && "bg-gradient-to-r from-ledger from-50% to-transparent to-50%",
                            c.status === "target" && "border-dashed bg-ink",
                            shown.id === c.id && "ring-4 ring-white/10",
                          )}
                          style={{ left: `${x(c.date)}%`, marginLeft: -8, marginTop: `${((i % 3) - 1) * 14 - 8}px` }}
                          aria-label={`${c.name}, ${c.issuer}, ${c.status}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex min-h-[72px] items-center gap-5 rounded-xl border border-line bg-ink/60 p-4">
                <span className={cn("rounded-full px-2.5 py-1 font-mono text-[10px] uppercase", shown.status === "earned" ? "bg-signal/15 text-signal" : shown.status === "in-progress" ? "bg-ledger/15 text-ledger" : "bg-ink-3 text-fg-muted")}>
                  {shown.status.replace("-", " ")}
                </span>
                <div>
                  <p className="font-medium">{shown.name}</p>
                  <p className="font-mono text-xs text-fg-faint">{shown.issuer} · {formatMonth(shown.date, shown.dateApprox)}{shown.credentialId ? ` · ID ${shown.credentialId}` : ""}</p>
                </div>
              </div>
            </div>

            {/* Mobile list */}
            <ol className="relative space-y-3 border-l border-line pl-5 md:hidden">
              {certifications.map((c) => {
                const t = TRACKS.find((tr) => tr.id === c.track)!;
                return (
                  <li key={c.id} className="relative">
                    <span className={cn("absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2", t.ring, c.status === "earned" ? t.color : "bg-ink", c.status === "target" && "border-dashed")} />
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="font-mono text-[11px] text-fg-faint">{c.issuer} · {formatMonth(c.date, c.dateApprox)} · {c.status.replace("-", " ")}</p>
                  </li>
                );
              })}
            </ol>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
