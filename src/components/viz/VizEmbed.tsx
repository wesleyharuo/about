"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, FileBarChart2, Loader2, Maximize2, Play, TriangleAlert } from "lucide-react";
import type { PowerBIViz, PrototypeViz, TableauViz, Visualization } from "@/lib/types";
import { isPublished, loadTableauApi, tableauProfileUrl, tableauThumb, tableauViewUrl } from "@/lib/viz";
import { asset, cn } from "@/lib/utils";

/**
 * One component for every kind of visualization on the site.
 *
 *  tableau   → Tableau Embedding API v3 <tableau-viz>, loaded on click
 *  powerbi   → "Publish to web" iframe when embedUrl is set;
 *              otherwise an exported-page gallery; otherwise a report card
 *  prototype → the self-contained HTML apps in /public/lab, in an iframe
 *
 * Everything is click-to-load ("poster first"): third-party BI embeds are
 * heavy and set cookies, so they never load until the visitor asks.
 */
export function VizEmbed({ viz, className, autoLoad = false }: { viz: Visualization; className?: string; autoLoad?: boolean }) {
  return (
    <div className={cn("relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-line bg-ink", className)}>
      {viz.platform === "tableau" && <TableauFrame viz={viz} autoLoad={autoLoad} />}
      {viz.platform === "powerbi" && <PowerBIFrame viz={viz} autoLoad={autoLoad} />}
      {viz.platform === "prototype" && <PrototypeFrame viz={viz} autoLoad={autoLoad} />}
    </div>
  );
}

function Poster({ onPlay, label, image, children }: { onPlay: () => void; label: string; image?: string; children?: React.ReactNode }) {
  const [imgOk, setImgOk] = useState(true);
  return (
    <button onClick={onPlay} className="group absolute inset-0 grid place-items-center text-left" aria-label={label}>
      {image && imgOk && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" loading="lazy" onError={() => setImgOk(false)} onLoad={(e) => { if (e.currentTarget.naturalWidth < 20) setImgOk(false); }} className="absolute inset-0 h-full w-full object-cover object-top opacity-50 transition duration-500 group-hover:scale-[1.02] group-hover:opacity-70" />
      )}
      {(!image || !imgOk) && children}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
      <span className="relative flex items-center gap-3 rounded-full border border-signal/50 bg-ink/80 px-5 py-3 text-sm font-medium backdrop-blur transition group-hover:shadow-glow">
        <Play className="h-4 w-4 fill-signal text-signal" /> {label}
      </span>
    </button>
  );
}

function FakeReport() {
  // Skeleton of a BI report, drawn only when there's no real thumbnail.
  return (
    <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 gap-3 p-5 opacity-40" aria-hidden>
      {[...Array(4)].map((_, i) => <div key={i} className="rounded-lg bg-ink-3" />)}
      <div className="col-span-3 row-span-2 rounded-lg bg-gradient-to-tr from-signal/10 to-synapse/10" />
      <div className="row-span-2 rounded-lg bg-ink-3" />
    </div>
  );
}

function TableauFrame({ viz, autoLoad }: { viz: TableauViz; autoLoad: boolean }) {
  if (!isPublished(viz)) return <ImageGallery title={viz.title} images={viz.screenshots ?? []} />;
  return <LiveTableau viz={viz} autoLoad={autoLoad} />;
}

/** Dashboard images: fit to frame, open the full-resolution image in a new tab. */
function ImageGallery({ title, images }: { title: string; images: string[] }) {
  const [page, setPage] = useState(0);
  if (!images.length) return <Centered>No preview yet.</Centered>;
  const src = asset(images[page]);
  return (
    <div className="absolute inset-0 bg-[#f3f4f6]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={`${title}${images.length > 1 ? ` — page ${page + 1}` : ""}`} className="h-full w-full object-contain" />
      <a href={src} target="_blank" rel="noreferrer" className="btn-ghost absolute right-3 top-3 !bg-ink/85 !p-2 text-fg backdrop-blur" aria-label="Open full-size image">
        <Maximize2 className="h-4 w-4" />
      </a>
      {images.length > 1 && (
        <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1.5 bg-gradient-to-t from-ink/80 p-3">
          {images.map((_, i) => (
            <button key={i} onClick={() => setPage(i)} className={cn("h-1.5 rounded-full transition-all", i === page ? "w-6 bg-signal" : "w-1.5 bg-fg-faint")} aria-label={`Page ${i + 1}`} />
          ))}
        </div>
      )}
    </div>
  );
}

function LiveTableau({ viz, autoLoad }: { viz: TableauViz; autoLoad: boolean }) {
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">(autoLoad ? "loading" : "idle");

  useEffect(() => {
    if (state !== "loading") return;
    loadTableauApi().then(() => setState("ready")).catch(() => setState("error"));
  }, [state]);

  if (state === "idle") return <Poster onPlay={() => setState("loading")} label="Load interactive Tableau viz" image={tableauThumb(viz)}><FakeReport /></Poster>;
  if (state === "loading") return <Centered><Loader2 className="h-5 w-5 animate-spin text-signal" /> Connecting to Tableau Public…</Centered>;
  if (state === "error")
    return (
      <Centered>
        <TriangleAlert className="h-5 w-5 text-ledger" />
        <span>Tableau couldn&apos;t load here.</span>
        <a className="btn-ghost !py-1.5" href={tableauProfileUrl(viz)} target="_blank" rel="noreferrer">Open on Tableau Public <ExternalLink className="h-3.5 w-3.5" /></a>
      </Centered>
    );
  return (
    <motion.div className="absolute inset-0 bg-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <tableau-viz src={tableauViewUrl(viz)} toolbar="bottom" hide-tabs width="100%" height="100%" style={{ width: "100%", height: "100%", display: "block" }} />
    </motion.div>
  );
}

function PowerBIFrame({ viz, autoLoad }: { viz: PowerBIViz; autoLoad: boolean }) {
  const [play, setPlay] = useState(autoLoad);
  const [page, setPage] = useState(0);

  if (viz.embedUrl) {
    if (!play) return <Poster onPlay={() => setPlay(true)} label="Load interactive Power BI report" image={viz.screenshots[0] ? asset(viz.screenshots[0]) : undefined}><FakeReport /></Poster>;
    return <iframe title={viz.title} src={viz.embedUrl} className="absolute inset-0 h-full w-full" allowFullScreen loading="lazy" />;
  }

  if (viz.screenshots.length) return <ImageGallery title={viz.title} images={viz.screenshots} />;

  // Not published yet: show an honest report card instead of a fake embed.
  return (
    <div className="absolute inset-0">
      <FakeReport />
      <div className="absolute inset-0 grid place-items-center bg-gradient-to-t from-ink via-ink/70 to-ink/30 p-6 text-center">
        <div>
          <FileBarChart2 className="mx-auto mb-3 h-8 w-8 text-ledger" />
          <p className="font-display text-lg font-semibold">{viz.title}</p>
          <p className="mt-1 font-mono text-xs text-fg-faint">{viz.pbip}</p>
          <p className="mx-auto mt-3 max-w-sm text-sm text-fg-muted">Live embed coming soon. The report is built as a Power BI project file — ask for a walkthrough.</p>
        </div>
      </div>
    </div>
  );
}

function PrototypeFrame({ viz, autoLoad }: { viz: PrototypeViz; autoLoad: boolean }) {
  const [play, setPlay] = useState(autoLoad);
  const src = asset(viz.src);
  if (!play) return <Poster onPlay={() => setPlay(true)} label="Launch interactive app" image={asset(viz.src.replace(/Main\.dc\.html$/, "poster.png"))}><FakeReport /></Poster>;
  return (
    <>
      <iframe title={viz.title} src={src} className="absolute inset-0 h-full w-full bg-white" loading="lazy" sandbox="allow-scripts allow-same-origin" />
      <a href={src} target="_blank" rel="noreferrer" className="btn-ghost absolute right-3 top-3 !bg-ink/80 !p-2 backdrop-blur" aria-label="Open full screen">
        <Maximize2 className="h-4 w-4" />
      </a>
    </>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-sm text-fg-muted">{children}</div>;
}
