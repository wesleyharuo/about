"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BrainCircuit, Menu, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { href: "/#dashboard", label: "Overview" },
  { href: "/#timeline", label: "Career" },
  { href: "/#skills", label: "Skills" },
  { href: "/#impact", label: "Impact" },
  { href: "/#lab", label: "Lab" },
  { href: "/#terminal", label: "Terminal" },
];

const ROUTES = [
  { href: "/dashboard/", label: "Dashboards" },
  { href: "/projects/", label: "Projects" },
];

export function openAsk(prefill?: string) {
  window.dispatchEvent(new CustomEvent("ask-wesley:open", { detail: prefill }));
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "border-b border-line/70 bg-ink/75 backdrop-blur-xl" : "bg-transparent",
      )}
    >
      <nav className="container flex h-16 items-center justify-between gap-4" aria-label="Primary">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="relative grid h-8 w-8 place-items-center rounded-lg border border-signal/40 bg-signal/10">
            <BrainCircuit className="h-4 w-4 text-signal" aria-hidden />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-pulseDot rounded-full bg-signal" />
          </span>
          <span className="font-display text-sm font-semibold tracking-tight">
            wesley<span className="text-fg-faint">.data</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {SECTIONS.map((s) => (
            <Link key={s.href} href={s.href} className="rounded-lg px-3 py-2 text-sm text-fg-muted transition hover:bg-ink-3 hover:text-fg">
              {s.label}
            </Link>
          ))}
          <span className="mx-2 h-4 w-px bg-line" />
          {ROUTES.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className={cn("rounded-lg px-3 py-2 text-sm transition hover:bg-ink-3", pathname?.startsWith(r.href.slice(0, -1)) ? "text-signal" : "text-fg-muted hover:text-fg")}
            >
              {r.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => openAsk()} className="btn-ghost hidden !py-2 sm:inline-flex">
            <Sparkles className="h-4 w-4 text-synapse" aria-hidden />
            Ask Wesley AI
          </button>
          <button className="btn-ghost !p-2 lg:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="border-t border-line bg-ink/95 backdrop-blur-xl lg:hidden"
          >
            <div className="container grid grid-cols-2 gap-1 py-4">
              {[...SECTIONS, ...ROUTES].map((s) => (
                <Link key={s.href} href={s.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-sm text-fg-muted hover:bg-ink-3 hover:text-fg">
                  {s.label}
                </Link>
              ))}
              <button onClick={() => { setOpen(false); openAsk(); }} className="col-span-2 mt-2 btn-primary">
                <Sparkles className="h-4 w-4" /> Ask Wesley AI
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
