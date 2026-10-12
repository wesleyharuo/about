"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, BrainCircuit, Sparkles, X } from "lucide-react";
import { ask, SUGGESTED_QUESTIONS, type AskAnswer } from "@/lib/ask-engine";
import { asset, cn } from "@/lib/utils";

type Msg = { role: "user"; text: string } | { role: "ai"; answer: AskAnswer; asked: string };

async function answer(question: string): Promise<AskAnswer> {
  await new Promise((r) => setTimeout(r, 450)); // a beat, so it reads as "thinking"
  return ask(question);
}

export function AskWesley() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  async function send(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    setQ("");
    setMsgs((m) => [...m, { role: "user", text: t }]);
    setBusy(true);
    const a = await answer(t);
    setMsgs((m) => [...m, { role: "ai", answer: a, asked: t }]);
    setBusy(false);
  }

  useEffect(() => {
    const onOpen = (e: Event) => {
      setOpen(true);
      const prefill = (e as CustomEvent<string | undefined>).detail;
      if (prefill) void send(prefill);
      setTimeout(() => inputRef.current?.focus(), 200);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((o) => !o); setTimeout(() => inputRef.current?.focus(), 200); }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("ask-wesley:open", onOpen);
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("ask-wesley:open", onOpen); window.removeEventListener("keydown", onKey); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" }); }, [msgs, busy]);

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 200); }}
            className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full border border-synapse/50 bg-ink-2/90 py-3 pl-4 pr-5 text-sm font-medium shadow-[0_0_40px_-8px_rgb(167_139_250/0.6)] backdrop-blur"
            aria-label="Open Ask Wesley AI"
          >
            <Sparkles className="h-4 w-4 text-synapse" /> <span className="hidden sm:inline">Ask Wesley AI</span><span className="sm:hidden">Ask AI</span>
            <kbd className="ml-1 hidden rounded border border-line px-1.5 font-mono text-[10px] text-fg-faint sm:inline">⌘K</kbd>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Ask Wesley AI"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-x-3 bottom-3 z-[70] flex max-h-[min(640px,calc(100svh-24px))] flex-col overflow-hidden rounded-2xl border border-line bg-ink-2/95 shadow-2xl backdrop-blur-xl sm:inset-x-auto sm:right-5 sm:w-[420px]"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-synapse/15"><BrainCircuit className="h-4 w-4 text-synapse" /></span>
                <div>
                  <p className="text-sm font-semibold">Ask Wesley AI</p>
                  <p className="font-mono text-[10px] text-fg-faint">grounded in his projects, roles &amp; certs</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-fg-muted hover:bg-ink-3" aria-label="Close"><X className="h-4 w-4" /></button>
            </div>

            <div ref={scroller} className="flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">
              {msgs.length === 0 && (
                <div>
                  <p className="text-sm text-fg-muted">Hi — I answer only from Wesley&apos;s own data: his roles, {""}projects, certifications, dashboards and publications. Try one:</p>
                  <div className="mt-3 flex flex-col gap-2">
                    {SUGGESTED_QUESTIONS.map((s) => (
                      <button key={s} onClick={() => send(s)} className="rounded-xl border border-line bg-ink/60 px-3 py-2 text-left text-sm text-fg-muted transition hover:border-synapse/50 hover:text-fg">{s}</button>
                    ))}
                  </div>
                </div>
              )}
              {msgs.map((m, i) =>
                m.role === "user" ? (
                  <div key={i} className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-signal px-3.5 py-2 text-sm text-ink">{m.text}</div>
                ) : (
                  <AiBubble key={i} a={m.answer} asked={m.asked} seed={i} onFollow={send} />
                ),
              )}
              {busy && (
                <div className="flex gap-1 px-1">
                  {[0, 1, 2].map((d) => <motion.span key={d} className="h-1.5 w-1.5 rounded-full bg-synapse" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: d * 0.15 }} />)}
                </div>
              )}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); void send(q); }} className="border-t border-line p-3">
              <div className="flex items-end gap-2 rounded-xl border border-line bg-ink px-3 py-2 focus-within:border-synapse/60">
                <textarea
                  ref={inputRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(q); } }}
                  rows={1}
                  placeholder="Ask about Power BI, SQL, certifications…"
                  className="max-h-28 flex-1 resize-none bg-transparent py-1 text-sm outline-none placeholder:text-fg-faint"
                  aria-label="Your question"
                />
                <button type="submit" disabled={!q.trim() || busy} className={cn("grid h-8 w-8 place-items-center rounded-lg transition", q.trim() ? "bg-synapse text-ink" : "bg-ink-3 text-fg-faint")} aria-label="Send">
                  <ArrowUp className="h-4 w-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function AiBubble({ a, asked, seed, onFollow }: { a: AskAnswer; asked: string; seed: number; onFollow: (q: string) => void }) {
  const pool = SUGGESTED_QUESTIONS.filter((s) => s !== asked);
  const follow = [pool[seed % pool.length], pool[(seed + 2) % pool.length]];
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="max-w-[95%] rounded-2xl rounded-bl-md border border-line bg-ink/70 p-3.5 text-sm">
      <p className="leading-relaxed">{a.text}</p>
      {a.bullets.length > 0 && (
        <ul className="mt-2.5 space-y-1.5">
          {a.bullets.map((b, i) => (
            <motion.li key={i} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }} className="flex gap-2 text-fg-muted">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-synapse" />{b}
            </motion.li>
          ))}
        </ul>
      )}
      {a.sources.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {a.sources.map((s) => (
            <a key={s.href + s.label} href={s.href.startsWith("/") ? asset(s.href) : s.href} target={s.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="chip !py-0.5 hover:border-synapse/50 hover:text-fg">↗ {s.label}</a>
          ))}
        </div>
      )}
      {(
        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-line pt-3">
          {follow.map((f) => <button key={f} onClick={() => onFollow(f)} className="text-left text-xs text-synapse hover:underline">{f} →</button>)}
        </div>
      )}
    </motion.div>
  );
}
