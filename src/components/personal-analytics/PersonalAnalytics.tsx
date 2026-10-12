"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Bar, BarChart, Cell, LabelList, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Pause, Play } from "lucide-react";
import { certsByYear, kpis, monthsByEra, projectCategories, repoLanguages } from "@/lib/analytics";
import { skills } from "@/lib/data";
import { ChartTooltip, Reveal, SectionHeader } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

const PALETTE = ["rgb(94 234 212)", "rgb(167 139 250)", "rgb(251 191 36)", "rgb(251 113 133)", "rgb(148 160 180)", "rgb(92 104 124)"];

export function PersonalAnalytics() {
  const k = kpis();
  const langs = repoLanguages();
  const cats = projectCategories();
  const certs = certsByYear();
  const eras = monthsByEra();
  const topSkill = [...skills.skills].sort((a, b) => b.level - a.level)[0];
  const longest = [...skills.skills].sort((a, b) => a.since - b.since)[0];
  const newest = [...skills.skills].sort((a, b) => b.since - a.since || b.level - a.level)[0];
  const certsThisWave = certs.filter((c) => Number(c.year) >= 2025).reduce((s, c) => s + c.added, 0);

  const slides = [
    { kicker: "Your top genre", big: topSkill.label, sub: `Depth ${topSkill.level}/100 · proven at ${topSkill.evidence.length} places`, bg: "from-signal/40 via-signal/10 to-ink-2" },
    { kicker: "Longest streak", big: `${2026 - longest.since} years of ${longest.label}`, sub: `Unbroken since ${longest.since} — from Informix to Snowflake`, bg: "from-synapse/40 via-synapse/10 to-ink-2" },
    { kicker: "Most played language", big: langs[0].name, sub: `${langs[0].value} of ${k.repos} public repositories`, bg: "from-ledger/40 via-ledger/10 to-ink-2" },
    { kicker: "Learning sprint", big: `${certsThisWave} certs since 2025`, sub: "Databricks, AI, statistics and business analysis", bg: "from-alert/40 via-alert/10 to-ink-2" },
    { kicker: "New release", big: newest.label, sub: `Added to the toolkit in ${newest.since}`, bg: "from-signal/40 via-synapse/10 to-ink-2" },
  ];
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setI((v) => (v + 1) % slides.length), 3800);
    return () => clearInterval(t);
  }, [playing, slides.length]);

  return (
    <section id="analytics" className="section scroll-mt-16">
      <div className="container">
        <SectionHeader
          index="07"
          eyebrow="Personal analytics"
          title={<>Wesley <span className="text-gradient">Wrapped</span>, 2006 – 2026.</>}
          lede="The same treatment a streaming app gives your listening history, applied to a career. Computed live from the repositories, certifications and roles behind this site."
        />

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Wrapped story card */}
          <Reveal className="lg:row-span-2">
            <div className="relative h-full min-h-[460px] overflow-hidden rounded-2xl border border-line">
              <AnimatePresence mode="wait">
                <motion.div
                  key={i}
                  className={cn("absolute inset-0 flex flex-col justify-between bg-gradient-to-br p-7", slides[i].bg)}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex gap-1">
                    {slides.map((_, j) => (
                      <div key={j} className="h-1 flex-1 overflow-hidden rounded-full bg-white/15">
                        <motion.div
                          className="h-full bg-white"
                          initial={{ width: j < i ? "100%" : "0%" }}
                          animate={{ width: j < i ? "100%" : j === i && playing ? "100%" : j === i ? "50%" : "0%" }}
                          transition={{ duration: j === i && playing ? 3.8 : 0, ease: "linear" }}
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="eyebrow !text-fg/70">{slides[i].kicker}</p>
                    <p className="mt-3 font-display text-5xl font-bold leading-[1.02] tracking-tight text-balance">{slides[i].big}</p>
                    <p className="mt-4 text-fg/80">{slides[i].sub}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-fg/60">{i + 1} / {slides.length}</span>
                    <button onClick={() => setPlaying((p) => !p)} className="grid h-10 w-10 place-items-center rounded-full bg-white text-ink" aria-label={playing ? "Pause" : "Play"}>
                      {playing ? <Pause className="h-4 w-4 fill-ink" /> : <Play className="h-4 w-4 fill-ink" />}
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <ChartCard title="Repository languages" note={`${k.repos} public repos`}>
              <div className="flex items-center gap-4">
                <div className="h-40 w-40 shrink-0">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={langs} dataKey="value" nameKey="name" innerRadius={44} outerRadius={70} paddingAngle={2} stroke="none">
                        {langs.map((_, j) => <Cell key={j} fill={PALETTE[j % PALETTE.length]} />)}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="space-y-1.5 text-sm">
                  {langs.map((l, j) => (
                    <li key={l.name} className="flex items-center gap-2">
                      <i className="h-2 w-2 rounded-full" style={{ background: PALETTE[j % PALETTE.length] }} />
                      <span className="text-fg-muted">{l.name}</span>
                      <span className="font-mono text-xs text-fg-faint">{l.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </ChartCard>
          </Reveal>

          <Reveal delay={0.1}>
            <ChartCard title="What the projects are about" note="by category">
              <div className="h-40">
                <ResponsiveContainer>
                  <BarChart data={cats} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" width={110} tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgb(20 26 36)" }} />
                    <Bar dataKey="value" name="Repos" radius={[0, 4, 4, 0]} barSize={12}>
                      {cats.map((_, j) => <Cell key={j} fill={PALETTE[j % PALETTE.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </Reveal>

          <Reveal delay={0.15}>
            <ChartCard title="Certifications, cumulative" note="earned only">
              <div className="h-40">
                <ResponsiveContainer>
                  <LineChart data={certs} margin={{ left: -24, right: 8, top: 8, bottom: 0 }}>
                    <CartesianGrid stroke="rgb(36 44 58)" strokeDasharray="3 6" vertical={false} />
                    <XAxis dataKey="year" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Line type="monotone" dataKey="total" name="Total" stroke="rgb(251 191 36)" strokeWidth={2.5} dot={{ r: 3, fill: "rgb(251 191 36)" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </Reveal>

          <Reveal delay={0.2}>
            <ChartCard title="Where the years went" note="years per era">
              <div className="h-40">
                <ResponsiveContainer>
                  <BarChart data={eras} layout="vertical" margin={{ left: 0, right: 28, top: 0, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" width={110} tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTooltip unit=" yrs" />} cursor={{ fill: "rgb(20 26 36)" }} />
                    <Bar dataKey="years" name="Years" radius={[0, 4, 4, 0]} barSize={12}>
                      {eras.map((_, j) => <Cell key={j} fill={PALETTE[j % PALETTE.length]} />)}
                      <LabelList dataKey="years" position="right" className="fill-fg-muted font-mono text-[11px]" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function ChartCard({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return (
    <div className="panel h-full p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <p className="text-sm font-medium">{title}</p>
        <p className="font-mono text-[11px] text-fg-faint">{note}</p>
      </div>
      {children}
    </div>
  );
}
