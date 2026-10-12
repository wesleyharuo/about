import type { TableauViz } from "./types";

/**
 * Tableau Public URL helpers.
 * workbook = the workbookRepoUrl, view = the sheet/dashboard name, both
 * visible in any Tableau Public URL: /views/<workbook>/<view>
 */
export const isPublished = (v: TableauViz): v is TableauViz & { workbook: string; view: string } => !!(v.workbook && v.view);
export const tableauViewUrl = (v: TableauViz) => `https://public.tableau.com/views/${v.workbook}/${v.view}`;
export const tableauProfileUrl = (v: TableauViz) => `https://public.tableau.com/app/profile/wesleyharuo/viz/${v.workbook}/${v.view}`;
// /thumb/views/... is what Tableau Public's own gallery uses. The older
// /static/images/<xx>/.../1.png path often returns a 1×1 placeholder.
export const tableauThumb = (v: TableauViz) => `https://public.tableau.com/thumb/views/${v.workbook}/${v.view}`;

export const TABLEAU_API = "https://public.tableau.com/javascripts/api/tableau.embedding.3.latest.min.js";

let tableauLoading: Promise<void> | null = null;
/** Loads the Tableau Embedding API v3 once, on demand (it's ~300 KB; never on first paint). */
export function loadTableauApi() {
  if (typeof window === "undefined") return Promise.resolve();
  if (customElements.get("tableau-viz")) return Promise.resolve();
  if (!tableauLoading) {
    tableauLoading = new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.type = "module";
      s.src = TABLEAU_API;
      s.onload = () => customElements.whenDefined("tableau-viz").then(() => resolve());
      s.onerror = () => { tableauLoading = null; reject(new Error("Tableau API failed to load")); };
      document.head.appendChild(s);
    });
  }
  return tableauLoading;
}

export const platformLabel = { tableau: "Tableau", powerbi: "Power BI", prototype: "Interactive app" } as const;
