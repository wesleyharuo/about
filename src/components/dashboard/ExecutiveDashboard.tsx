"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, LabelList } from "recharts";
import { Activity, Award, BookOpen, Briefcase, FolderGit2, LayoutDashboard } from "lucide-react";
import { profile } from "@/lib/data";
import { automationSavings, kpis, toolkitGrowth } from "@/lib/analytics";
import { ChartTooltip, Counter, LiveDot, Reveal, SectionHeader } from "@/components/ui/primitives";

export function ExecutiveDashboard() {
  const k = kpis();
  const growth = toolkitGrowth();
  const savings = automationSavings();

  const tiles = [
    { icon: Activity, label: "Years in systems & data", value: k.years, foot: "since 2006", tone: "text-signal" },
    { icon: Briefcase, label: "Roles", value: k.roles, foot: "Brazil → Canada", tone: "text-fg" },
    { icon: FolderGit2, label: "Public repositories", value: k.repos, foot: `${k.pythonShare}% Python`, tone: "text-synapse" },
    { icon: LayoutDashboard, label: "Public dashboards", value: k.dashboards, foot: `${k.powerbi} Power BI · ${k.tableau} Tableau · ${k.prototypes} apps`, tone: "text-signal" },
    { icon: Award, label: "Certifications", value: k.certsEarned, foot: `earned · ${k.certsInProgress} in progress · ${k.certsTarget} next`, tone: "text-ledger" },
    { icon: BookOpen, label: "Publications", value: k.publications, foot: "AI risk & security", tone: "text-synapse" },
  ];

  return (
    <section id="dashboard" className="section scroll-mt-16">
      <div className="container">
        <SectionHeader
          index="01"
          eyebrow="Executive dashboard"
          title={<>The career, as a <span className="text-gradient">KPI board.</span></>}
          lede="Read it like any review deck: the headline numbers first, then where the time went and what it saved. Every tile is computed from the data behind this site."
        />

        <Reveal>
          <div className="panel overflow-hidden">
            {/* window chrome */}
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-alert/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-ledger/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-signal/70" />
                <span className="ml-3 font-mono text-xs text-fg-faint">wesley.data / executive-overview</span>
              </div>
              <span className="flex items-center gap-2 font-mono text-[11px] text-fg-faint">
                <LiveDot /> data reconciled
              </span>
            </div>

            <div className="grid grid-cols-2 gap-px bg-line/60 md:grid-cols-3 xl:grid-cols-6">
              {tiles.map((t) => (
                <div key={t.label} className="bg-ink-2 p-5">
                  <t.icon className={`mb-4 h-4 w-4 ${t.tone}`} aria-hidden />
                  <p className={`font-display text-4xl font-semibold ${t.tone}`}>
                    <Counter to={t.value} />
                  </p>
                  <p className="mt-1 text-sm text-fg">{t.label}</p>
                  <p className="mt-1 font-mono text-[11px] text-fg-faint">{t.foot}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-px bg-line/60 lg:grid-cols-5">
              <div className="bg-ink-2 p-5 lg:col-span-3">
                <div className="mb-4 flex items-baseline justify-between">
                  <div>
                    <p className="text-sm font-medium">Toolkit growth</p>
                    <p className="text-xs text-fg-faint">Skills in active use, by year</p>
                  </div>
                  <p className="font-mono text-xs text-fg-faint">2006 → 2026</p>
                </div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={growth} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gSkills" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgb(94 234 212)" stopOpacity={0.45} />
                          <stop offset="100%" stopColor="rgb(94 234 212)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gFin" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgb(251 191 36)" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="rgb(251 191 36)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gAi" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgb(167 139 250)" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="rgb(167 139 250)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgb(36 44 58)" strokeDasharray="3 6" vertical={false} />
                      <XAxis dataKey="year" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Area type="monotone" name="All skills" dataKey="skills" stroke="rgb(94 234 212)" strokeWidth={2} fill="url(#gSkills)" />
                      <Area type="monotone" name="Finance" dataKey="finance" stroke="rgb(251 191 36)" strokeWidth={1.5} fill="url(#gFin)" />
                      <Area type="monotone" name="AI & automation" dataKey="ai" stroke="rgb(167 139 250)" strokeWidth={1.5} fill="url(#gAi)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 flex flex-wrap gap-4 font-mono text-[11px] text-fg-muted">
                  <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-signal" />All skills</span>
                  <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-ledger" />Finance</span>
                  <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-synapse" />AI &amp; automation</span>
                </div>
              </div>

              <div className="bg-ink-2 p-5 lg:col-span-2">
                <p className="text-sm font-medium">Automation impact</p>
                <p className="mb-4 text-xs text-fg-faint">Working hours per monthly cycle (8-h days), before → after</p>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={savings} layout="vertical" margin={{ top: 0, right: 40, left: 0, bottom: 0 }} barGap={4}>
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="company" tickLine={false} axisLine={false} width={84} />
                      <Tooltip content={<ChartTooltip unit=" h" />} cursor={{ fill: "rgb(20 26 36)" }} />
                      <Bar dataKey="before" name="Before" fill="rgb(92 104 124)" radius={[0, 4, 4, 0]} barSize={10} />
                      <Bar dataKey="after" name="After" radius={[0, 4, 4, 0]} barSize={10}>
                        {savings.map((s) => <Cell key={s.company} fill="rgb(94 234 212)" />)}
                        <LabelList dataKey="after" position="right" formatter={(v: number) => `${v}h`} className="fill-signal font-mono text-[11px]" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {savings.map((s) => (
                    <div key={s.company} className="rounded-xl border border-line bg-ink-3/60 p-3">
                      <p className="font-display text-2xl font-semibold text-signal">−{s.reduction}%</p>
                      <p className="text-xs text-fg-muted">{s.label}, {s.company}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-px bg-line/60 sm:grid-cols-2 xl:grid-cols-4">
              {profile.headlineImpact.map((h) => (
                <div key={h.label} className="bg-ink-2 p-5">
                  <p className="font-display text-3xl font-semibold text-ledger">{h.value}</p>
                  <p className="mt-1 text-sm">{h.label}</p>
                  <p className="mt-1 font-mono text-[11px] text-fg-faint">{h.context}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
