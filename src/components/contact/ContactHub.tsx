"use client";

import { useState } from "react";
import { Check, Copy, FileText, Github, Linkedin, Mail, BarChart3, BookOpen, Send } from "lucide-react";
import { profile } from "@/lib/data";
import { asset, cn } from "@/lib/utils";
import { LiveDot, Reveal, SectionHeader } from "@/components/ui/primitives";

const NEEDS = [
  "Financial data that doesn't agree",
  "A migration that must reconcile",
  "Manual reporting → pipeline",
  "Power BI / Tableau dashboards",
  "AI adoption with controls",
  "Fraud & anomaly detection",
];

export function ContactHub() {
  const [copied, setCopied] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");

  const copy = async () => {
    try { await navigator.clipboard.writeText(profile.contact.email); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* clipboard blocked */ }
  };

  // No backend on GitHub Pages: compose a pre-filled email instead of POSTing.
  const mailto = `mailto:${profile.contact.email}?subject=${encodeURIComponent(`Hello Wesley${name ? ` — from ${name}` : ""}`)}&body=${encodeURIComponent(
    `${picked.length ? `I'm looking for help with: ${picked.join(", ")}.\n\n` : ""}${msg}`,
  )}`;

  const links = [
    { icon: Linkedin, label: "LinkedIn", sub: "linkedin.com/in/wesleyharuo", href: profile.contact.linkedin || "" },
    { icon: Github, label: "GitHub", sub: `${profile.stats.publicRepos} public repos`, href: profile.contact.github || "" },
    { icon: BarChart3, label: "Tableau Public", sub: "public.tableau.com/wesleyharuo", href: profile.contact.tableau || "" },
    { icon: BookOpen, label: "ORCID", sub: "0009-0002-1368-2250", href: profile.contact.orcid || "" },
    { icon: FileText, label: "Résumé", sub: "PDF", href: asset(profile.contact.resume) || "" },
  ].filter((link) => Boolean(link.href));

  return (
    <section id="contact" className="section scroll-mt-16">
      <div className="container">
        <SectionHeader
          index="10"
          eyebrow="Contact hub"
          title={<>Have numbers that <span className="text-gradient">don&apos;t agree?</span></>}
          lede={profile.availability}
        />
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <Reveal>
            <div className="panel h-full p-6 md:p-8">
              <p className="mb-4 flex items-center gap-2 text-sm text-fg-muted"><LiveDot /> Open to new roles · GTA, hybrid or remote</p>
              <p className="eyebrow mb-3">What do you need?</p>
              <div className="flex flex-wrap gap-2">
                {NEEDS.map((n) => {
                  const on = picked.includes(n);
                  return (
                    <button key={n} onClick={() => setPicked((p) => (on ? p.filter((x) => x !== n) : [...p, n]))} className={cn("chip transition", on && "border-signal/60 bg-signal/10 text-fg")} aria-pressed={on}>
                      {on && <Check className="h-3 w-3 text-signal" />} {n}
                    </button>
                  );
                })}
              </div>
              <div className="mt-6 grid gap-3">
                <label className="sr-only" htmlFor="c-name">Your name</label>
                <input id="c-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name / company" className="rounded-xl border border-line bg-ink px-4 py-3 text-sm outline-none ring-0 placeholder:text-fg-faint focus:border-signal/60" />
                <label className="sr-only" htmlFor="c-msg">Message</label>
                <textarea id="c-msg" value={msg} onChange={(e) => setMsg(e.target.value)} rows={4} placeholder="A sentence about the problem…" className="resize-none rounded-xl border border-line bg-ink px-4 py-3 text-sm outline-none placeholder:text-fg-faint focus:border-signal/60" />
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <a href={mailto} className="btn-primary"><Send className="h-4 w-4" /> Compose email</a>
                <button onClick={copy} className="btn-ghost">
                  {copied ? <Check className="h-4 w-4 text-signal" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : profile.contact.email}
                </button>
              </div>
              <p className="mt-3 text-xs text-fg-faint">Opens your email app with the message pre-filled — nothing is stored on this site.</p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="grid h-full gap-3">
              {links.map((l) => (
                <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className="panel panel-hover group flex items-center gap-4 p-4">
                  <span className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-ink"><l.icon className="h-4 w-4 text-signal" /></span>
                  <span className="flex-1">
                    <span className="block font-medium">{l.label}</span>
                    <span className="block font-mono text-xs text-fg-faint">{l.sub}</span>
                  </span>
                  <span className="text-fg-faint transition group-hover:translate-x-1 group-hover:text-signal">→</span>
                </a>
              ))}
              <div className="panel flex items-center gap-4 p-4">
                <Mail className="h-4 w-4 text-fg-faint" />
                <p className="text-sm text-fg-muted">{profile.status} · {profile.location} · {profile.languages.map((l) => l.name).join(" & ")}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
