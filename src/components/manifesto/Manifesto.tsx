"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";

const LINES = [
  "A wrong total is never the problem.",
  "It's the credit note entered twice, the account mapped to the wrong line, the join that dropped a row.",
  "So I fix errors where they start, not where they show up.",
  "I build pipelines around what correct books look like.",
  "I use AI every day — and I audit it in the same workflow.",
  "The report is the last step, not the first.",
  "Numbers should agree before anyone decides on them.",
];

export function Manifesto() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.6"] });

  return (
    <section id="manifesto" ref={ref} className="section scroll-mt-16 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(167_139_250/0.10),transparent_60%)]" />
      <div className="container relative max-w-4xl">
        <p className="eyebrow mb-10 flex items-center gap-3"><span className="text-signal">09</span><span className="h-px w-8 bg-line" />Personal manifesto</p>
        <div className="space-y-6">
          {LINES.map((l, i) => (
            <ManifestoLine key={i} text={l} index={i} total={LINES.length} progress={scrollYProgress} />
          ))}
        </div>
        <p className="mt-12 font-mono text-sm text-fg-faint">— Wesley Haruo Kurosawa da Silva</p>
      </div>
    </section>
  );
}

function ManifestoLine({ text, index, total, progress }: { text: string; index: number; total: number; progress: MotionValue<number> }) {
  const start = index / total;
  const end = start + 1 / total;
  const opacity = useTransform(progress, [start - 0.05, end], [0.15, 1]);
  const x = useTransform(progress, [start - 0.05, end], [-12, 0]);
  const last = index === total - 1;
  return (
    <motion.p style={{ opacity, x }} className={`font-display text-2xl font-semibold leading-snug tracking-tight text-balance md:text-4xl ${last ? "text-gradient" : ""}`}>
      {text}
    </motion.p>
  );
}
