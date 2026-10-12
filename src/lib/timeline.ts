import { experience } from "./data";
import type { Experience } from "./types";

const NOW = new Date(2026, 9, 1); // build-time "today"; bump when you redeploy

export function toDate(ym: string | null) {
  if (!ym) return NOW;
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, (m || 1) - 1, 1);
}

export function monthsBetween(a: string, b: string | null) {
  const s = toDate(a);
  const e = toDate(b);
  return Math.max(1, (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()));
}

export function formatDuration(months: number) {
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (!y) return `${m} mo`;
  if (!m) return `${y} yr`;
  return `${y} yr ${m} mo`;
}

export interface TimelineItem extends Experience {
  months: number;
  startYear: number;
  endYear: number;
}

/** Chronological (oldest → newest) — the story reads bottom-up like the career did. */
export function getTimeline(): TimelineItem[] {
  return [...experience]
    .sort((a, b) => toDate(a.start).getTime() - toDate(b.start).getTime())
    .map((e) => ({
      ...e,
      months: monthsBetween(e.start, e.end),
      startYear: toDate(e.start).getFullYear(),
      endYear: toDate(e.end).getFullYear(),
    }));
}

export const careerYears = () => NOW.getFullYear() - 2006;
