"use client";

import { useEffect, useRef, useState } from "react";
import { TerminalSquare } from "lucide-react";
import { profile } from "@/lib/data";
import { kpis } from "@/lib/analytics";
import { ask } from "@/lib/ask-engine";
import { runSql, TABLES } from "@/lib/mini-sql";
import { asset } from "@/lib/utils";
import { Reveal, SectionHeader } from "@/components/ui/primitives";

type Line = { kind: "in" | "out" | "err" | "table"; text?: string; table?: { columns: string[]; rows: Record<string, unknown>[]; ms: number } };

const COMMANDS = ["help", "whoami", "stats", "tables", "sql", "ask", "open", "goto", "clear", "history"];
const EXAMPLES = [
  "SELECT title, language FROM projects WHERE featured = true",
  "SELECT language, COUNT(*) FROM projects GROUP BY language ORDER BY count DESC",
  "SELECT skill, level, since FROM skills ORDER BY level DESC LIMIT 5",
  "SELECT name, issuer FROM certifications WHERE status = 'earned' AND date LIKE '2025%'",
];

const HELP = `Available commands
  whoami               who is behind this terminal
  stats                headline KPIs
  tables               list queryable tables
  sql <query>          run SQL over Wesley's data   (try: sql ${EXAMPLES[1]})
  ask <question>       ask Wesley AI from the shell
  open <target>        github | linkedin | tableau | orcid | resume
  goto <section>       dashboard | timeline | skills | impact | lab | contact
  history · clear
Tip: ↑/↓ recalls history, Tab completes commands.`;

export function Terminal() {
  const [lines, setLines] = useState<Line[]>([
    { kind: "out", text: "wesley.data command center v1.0 — 6 tables mounted, all totals reconciled" },
    { kind: "out", text: 'Type "help", or press Tab on an empty line to run an example query.' },
  ]);
  const [input, setInput] = useState("");
  const [hist, setHist] = useState<string[]>([]);
  const [hi, setHi] = useState(-1);
  const [exampleIdx, setExampleIdx] = useState(0);
  const body = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { body.current?.scrollTo({ top: body.current.scrollHeight, behavior: "smooth" }); }, [lines]);

  const print = (...l: Line[]) => setLines((prev) => [...prev, ...l]);

  function exec(raw: string) {
    const cmd = raw.trim();
    print({ kind: "in", text: cmd });
    if (!cmd) return;
    setHist((h) => [...h, cmd]);
    setHi(-1);
    const [head, ...rest] = cmd.split(" ");
    const arg = rest.join(" ").trim();
    const isSql = /^select\s/i.test(cmd);

    try {
      if (isSql || head === "sql") {
        const res = runSql(isSql ? cmd : arg);
        print({ kind: "table", table: res });
        return;
      }
      switch (head.toLowerCase()) {
        case "help": print({ kind: "out", text: HELP }); break;
        case "whoami": print({ kind: "out", text: `${profile.name}\n${profile.title} · ${profile.location}\n\n"${profile.signature}"` }); break;
        case "stats": {
          const k = kpis();
          print({ kind: "out", text: `years_in_data ......... ${k.years}\nroles ................. ${k.roles}\npublic_repos .......... ${k.repos}\ndashboards ............ ${k.dashboards}\ncertifications ........ ${k.certsEarned}\npublications .......... ${k.publications}` });
          break;
        }
        case "tables": print({ kind: "out", text: Object.entries(TABLES).map(([n, f]) => `${n.padEnd(15)} ${f().length} rows · ${Object.keys(f()[0]).join(", ")}`).join("\n") }); break;
        case "ask": {
          if (!arg) throw new Error("Usage: ask <question>");
          const a = ask(arg);
          print({ kind: "out", text: `${a.text}\n${a.bullets.slice(0, 6).map((b) => `  • ${b}`).join("\n")}` });
          break;
        }
        case "open": {
          const map: Record<string, string> = { github: profile.contact.github, linkedin: profile.contact.linkedin, tableau: profile.contact.tableau, orcid: profile.contact.orcid, resume: asset(profile.contact.resume) };
          const url = map[arg.toLowerCase()];
          if (!url) throw new Error(`Unknown target. Try: ${Object.keys(map).join(" | ")}`);
          window.open(url, "_blank", "noopener");
          print({ kind: "out", text: `opening ${url} …` });
          break;
        }
        case "goto": {
          const id = arg.toLowerCase();
          const el = document.getElementById(id);
          if (!el) throw new Error(`No section "${id}".`);
          el.scrollIntoView({ behavior: "smooth" });
          print({ kind: "out", text: `→ #${id}` });
          break;
        }
        case "history": print({ kind: "out", text: hist.map((h, i) => `${String(i + 1).padStart(3)}  ${h}`).join("\n") || "(empty)" }); break;
        case "clear": setLines([]); break;
        case "sudo": print({ kind: "err", text: "Permission denied: reconciliation can't be skipped. 🙂" }); break;
        default: throw new Error(`command not found: ${head}. Type "help".`);
      }
    } catch (e) {
      print({ kind: "err", text: (e as Error).message });
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") { exec(input); setInput(""); }
    else if (e.key === "ArrowUp") { e.preventDefault(); const n = hi < 0 ? hist.length - 1 : Math.max(0, hi - 1); if (hist[n]) { setHi(n); setInput(hist[n]); } }
    else if (e.key === "ArrowDown") { e.preventDefault(); const n = hi + 1; if (n >= hist.length) { setHi(-1); setInput(""); } else { setHi(n); setInput(hist[n]); } }
    else if (e.key === "Tab") {
      e.preventDefault();
      if (!input) { setInput(`sql ${EXAMPLES[exampleIdx % EXAMPLES.length]}`); setExampleIdx((i) => i + 1); return; }
      const match = COMMANDS.find((c) => c.startsWith(input.toLowerCase()));
      if (match) setInput(match + " ");
    }
  }

  return (
    <section id="terminal" className="section scroll-mt-16">
      <div className="container">
        <SectionHeader
          index="08"
          eyebrow="Command center"
          title={<>Query the analyst <span className="text-gradient">directly.</span></>}
          lede="A real (tiny) SQL engine runs over the same data that powers this page. Six tables: projects, experience, certifications, skills, dashboards, publications."
        />
        <div className="mb-4 flex flex-wrap gap-2">
          {EXAMPLES.slice(0, 3).map((ex) => (
            <button key={ex} onClick={() => { exec(ex); inputRef.current?.focus({ preventScroll: true }); }} className="chip max-w-full truncate hover:border-signal/50 hover:text-fg">
              <span className="text-signal">$</span> {ex}
            </button>
          ))}
        </div>
        <Reveal>
          <div className="panel overflow-hidden font-mono text-[13px]" onClick={() => inputRef.current?.focus({ preventScroll: true })}>
            <div className="flex items-center gap-2 border-b border-line px-4 py-2.5 text-xs text-fg-faint">
              <TerminalSquare className="h-4 w-4 text-signal" /> wesley@data-brain: ~
            </div>
            <div ref={body} className="h-[420px] overflow-y-auto p-4 leading-6" aria-live="polite">
              {lines.map((l, i) => {
                if (l.kind === "in") return <p key={i}><span className="text-signal">❯</span> <span className="text-fg">{l.text}</span></p>;
                if (l.kind === "err") return <p key={i} className="whitespace-pre-wrap text-alert">{l.text}</p>;
                if (l.kind === "table" && l.table) return <ResultTable key={i} {...l.table} />;
                return <p key={i} className="whitespace-pre-wrap text-fg-muted">{l.text}</p>;
              })}
              <div className="flex items-center">
                <span className="text-signal">❯</span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKey}
                  className="ml-2 flex-1 bg-transparent text-fg caret-signal outline-none"
                  spellCheck={false}
                  autoCapitalize="off"
                  autoComplete="off"
                  aria-label="Terminal input"
                  placeholder="help"
                />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ResultTable({ columns, rows, ms }: { columns: string[]; rows: Record<string, unknown>[]; ms: number }) {
  return (
    <div className="my-2 overflow-x-auto">
      <table className="min-w-full border-collapse text-left text-xs">
        <thead>
          <tr>{columns.map((c) => <th key={c} className="border-b border-line px-3 py-1.5 font-medium text-ledger">{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-ink-3/60">
              {columns.map((c) => <td key={c} className="max-w-[360px] truncate px-3 py-1 text-fg-muted">{String(r[c] ?? "NULL")}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-1 text-[11px] text-fg-faint">({rows.length} row{rows.length === 1 ? "" : "s"}, {ms} ms)</p>
    </div>
  );
}
