"use client";

import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/** Section heading: mono index + eyebrow, big title, short lede. */
export function SectionHeader({
  index,
  eyebrow,
  title,
  lede,
  className,
}: {
  index: string;
  eyebrow: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  className?: string;
}) {
  return (
    <Reveal className={cn("mb-12 max-w-3xl md:mb-16", className)}>
      <p className="eyebrow mb-4 flex items-center gap-3">
        <span className="text-signal">{index}</span>
        <span className="h-px w-8 bg-line" />
        {eyebrow}
      </p>
      <h2 className="h-section text-balance">{title}</h2>
      {lede && <p className="mt-5 text-pretty text-lg leading-relaxed text-fg-muted">{lede}</p>}
    </Reveal>
  );
}

/** Fade-and-rise on first scroll into view. Respects reduced motion. */
export function Reveal({ children, className, delay = 0, y = 24 }: { children: React.ReactNode; className?: string; delay?: number; y?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Counts up from 0 when scrolled into view. */
export function Counter({ to, decimals = 0, prefix = "", suffix = "", className }: { to: number; decimals?: number; prefix?: string; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => `${prefix}${v.toLocaleString("en-CA", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`);

  useEffect(() => {
    if (!inView) return;
    if (reduce) { mv.set(to); return; }
    const c = animate(mv, to, { duration: 1.6, ease: [0.16, 1, 0.3, 1] });
    return () => c.stop();
  }, [inView, to, mv, reduce]);

  return <motion.span ref={ref} className={cn("tabular-nums", className)}>{text}</motion.span>;
}

export function LiveDot({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-flex h-2 w-2", className)}>
      <span className="absolute inset-0 animate-ping rounded-full bg-signal/60" />
      <span className="relative h-2 w-2 rounded-full bg-signal" />
    </span>
  );
}

/** Dark tooltip shared by every Recharts chart. */
export function ChartTooltip({ active, payload, label, unit }: { active?: boolean; payload?: { name: string; value: number; color?: string }[]; label?: string; unit?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-ink/95 px-3 py-2 text-xs shadow-card backdrop-blur">
      {label && <p className="mb-1 font-mono text-fg-faint">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-2 text-fg">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          {p.name}: <span className="font-mono">{p.value}{unit ?? ""}</span>
        </p>
      ))}
    </div>
  );
}
