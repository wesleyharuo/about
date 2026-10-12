import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Accent } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Prefix a /public asset with the GitHub Pages base path. next/link does this for routes, but not for raw src/href. */
export function asset(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  // NEXT_PUBLIC_ASSET_BASE only exists for relative-path preview builds; production uses the base path.
  const base = process.env.NEXT_PUBLIC_ASSET_BASE ?? process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export const accentText: Record<Accent, string> = {
  signal: "text-signal",
  synapse: "text-synapse",
  ledger: "text-ledger",
  alert: "text-alert",
  fg: "text-fg-muted",
};

export const accentBg: Record<Accent, string> = {
  signal: "bg-signal",
  synapse: "bg-synapse",
  ledger: "bg-ledger",
  alert: "bg-alert",
  fg: "bg-fg-muted",
};

/** CSS color string for charts/canvas, where Tailwind classes can't reach. */
export const accentRgb: Record<Accent, string> = {
  signal: "rgb(94 234 212)",
  synapse: "rgb(167 139 250)",
  ledger: "rgb(251 191 36)",
  alert: "rgb(251 113 133)",
  fg: "rgb(148 160 180)",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function formatMonth(ym: string | null, approx = false) {
  if (!ym) return "Present";
  const [y, m] = ym.split("-");
  if (!m) return y;
  return `${approx ? "~" : ""}${MONTHS[Number(m) - 1]} ${y}`;
}
