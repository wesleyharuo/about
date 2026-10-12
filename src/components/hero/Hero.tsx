"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, FileText, Sparkles } from "lucide-react";
import { profile } from "@/lib/data";
import { kpis } from "@/lib/analytics";
import { LiveDot } from "@/components/ui/primitives";
import { openAsk } from "@/components/shell/Nav";
import { asset } from "@/lib/utils";

const BrainScene = dynamic(() => import("./BrainScene"), { ssr: false });

const BOOT = [
  "> mounting /career  ......... 7 roles · 2 countries",
  "> indexing /projects ........ 48 repositories",
  "> loading /dashboards ....... power bi · tableau · prototypes",
  "> reconciling totals ........ ✓ all numbers tie out",
];

export function Hero() {
  const k = kpis();
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const [line, setLine] = useState(reduce ? BOOT.length : 0);
  const [webgl, setWebgl] = useState(false);

  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      setWebgl(!!(c.getContext("webgl2") || c.getContext("webgl")));
    } catch { setWebgl(false); }
  }, []);

  useEffect(() => {
    if (line >= BOOT.length) return;
    const t = setTimeout(() => setLine((l) => l + 1), 520);
    return () => clearTimeout(t);
  }, [line]);

  const words = profile.mission.split(" ");

  return (
    <section ref={ref} className="relative flex min-h-[100svh] items-center overflow-hidden pt-16">
      <div className="bg-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-signal/10 blur-[120px]" />

      <div className="absolute inset-y-0 right-[-20%] w-[100%] opacity-60 md:right-[-8%] md:w-[62%] md:opacity-100">
        {webgl && !reduce ? <BrainScene /> : <div className="absolute inset-0 m-auto h-72 w-72 rounded-full bg-gradient-to-br from-signal/20 to-synapse/20 blur-3xl" />}
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 z-[5] w-full bg-gradient-to-r from-ink from-30% via-ink/80 via-55% to-transparent md:w-[78%]" />
      <motion.div style={{ y, opacity }} className="container relative z-10">
        <div className="max-w-3xl">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="chip mb-8 bg-ink/60 backdrop-blur">
            <LiveDot /> {profile.title} · {profile.location} · open to roles
          </motion.p>

          <p className="eyebrow mb-4">Inside Wesley&apos;s data brain</p>
          <h1 className="h-display text-balance !leading-[1.02] md:!text-7xl">
            {words.map((w, i) => (
              <motion.span
                key={i}
                className={`inline-block pr-[0.25em] ${/agree/.test(w) ? "text-gradient" : ""}`}
                initial={reduce ? false : { opacity: 0, y: 30, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.15 + i * 0.06, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                {w}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-fg-muted"
          >
            {profile.name}. {k.years} years between the database and the balance sheet — SQL in production since 2006, finance since 2016,
            automation and AI today.
          </motion.p>

          <motion.div initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} className="mt-8 flex flex-wrap gap-3">
            <Link href="#dashboard" className="btn-primary">
              Enter the dashboard <ArrowDown className="h-4 w-4" />
            </Link>
            <button onClick={() => openAsk()} className="btn-ghost">
              <Sparkles className="h-4 w-4 text-synapse" /> Ask Wesley AI
            </button>
            <a href={asset(profile.contact.resume)} className="btn-ghost" target="_blank" rel="noreferrer">
              <FileText className="h-4 w-4" /> Résumé
            </a>
          </motion.div>

          <div className="panel mt-10 max-w-xl p-4 font-mono text-xs leading-6 text-fg-muted" aria-label="System boot log">
            {BOOT.slice(0, line).map((l, i) => (
              <motion.p key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className={i === BOOT.length - 1 ? "text-signal" : ""}>
                {l}
              </motion.p>
            ))}
            {line < BOOT.length && <span className="inline-block h-3.5 w-2 animate-blink bg-signal align-middle" />}
          </div>
        </div>
      </motion.div>

      <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.3em] text-fg-faint">
        scroll to explore
      </div>
    </section>
  );
}
