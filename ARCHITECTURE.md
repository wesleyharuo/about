# Inside Wesley's Data Brain — Architecture

A static Next.js site that behaves like a BI product: every number on it is computed from JSON at build time, the dashboards are real (Power BI, Tableau, React apps), and visitors can query it with SQL or ask it questions in plain English.

---

## 1. Information architecture

```
/                       The story, one scroll, 11 chapters
├── #hero               Hook: the mission + a 3D neural brain + boot log
├── #dashboard   01     Executive dashboard: 6 KPIs, toolkit growth, automation impact
├── #timeline    02     Career timeline: Gantt 2006→now, role drill-down
├── #skills      03     Skill network: skills ↔ the roles/projects that prove them
├── #impact      04     Business impact stories: Netflix-style row, problem → action → result
├── #lab         05     Analytics lab: Power BI · Tableau · interactive apps, embedded
├── #certifications 06  Certification roadmap: 4 tracks on a time axis, earned → next
├── #analytics   07     Personal analytics: "Wesley Wrapped" + 4 charts
├── #terminal    08     Command center: a real mini-SQL engine over the site's data
├── #manifesto   09     Personal manifesto: scroll-revealed principles
└── #contact     10     Contact hub: intent chips → pre-filled email, links

/dashboard/             Full gallery of all 13 visualizations, filter + modal player
/projects/              All 48 repositories, searchable and filterable
/skills/                Skill network + certification roadmap
/about/                 Timeline + manifesto + contact

Global: Ask Wesley AI (floating, ⌘K), sticky nav, 404 "row not found"
```

## 2. UX flow

The scroll order is the argument a hiring manager needs, in the order they need it:

| Stage | Question in the visitor's head | Section that answers it |
|---|---|---|
| Hook (5 s) | "Who is this and why should I care?" | Hero — one sentence mission, not a job title |
| Proof (30 s) | "Is there substance?" | Executive dashboard — numbers first, like a review deck |
| Context | "Where does it come from?" | Timeline → Skill network |
| Value | "What did it change for a business?" | Impact stories |
| Hands-on | "Can I see the work?" | Analytics lab (live embeds) |
| Trajectory | "Is he still growing?" | Certification roadmap → Wrapped |
| Delight | "Is he different?" | Terminal (SQL), Ask Wesley AI |
| Belief | "How does he think?" | Manifesto |
| Action | "How do I reach him?" | Contact hub |

Three escape hatches at every point: the nav, Ask Wesley AI (⌘K), and the résumé PDF.

## 3. Folder structure

```
src/
├── app/                      Next.js App Router (static export)
│   ├── layout.tsx            fonts, metadata, JSON-LD Person, Nav, Footer, AskWesley
│   ├── page.tsx              the 11-chapter story
│   ├── dashboard/page.tsx    visualization gallery
│   ├── projects/page.tsx     repository explorer
│   ├── skills/page.tsx
│   ├── about/page.tsx
│   └── not-found.tsx
├── components/
│   ├── hero/                 Hero.tsx, BrainScene.tsx (React Three Fiber)
│   ├── dashboard/            ExecutiveDashboard.tsx
│   ├── timeline/             CareerTimeline.tsx
│   ├── skill-network/        SkillNetwork.tsx
│   ├── impact/               ImpactStories.tsx
│   ├── analytics-lab/        AnalyticsLab.tsx
│   ├── viz/                  VizEmbed.tsx  ← Power BI / Tableau / app embeds
│   │                         DashboardGallery.tsx
│   ├── certifications/       CertRoadmap.tsx
│   ├── personal-analytics/   PersonalAnalytics.tsx
│   ├── command-center/       Terminal.tsx
│   ├── manifesto/            Manifesto.tsx
│   ├── contact/              ContactHub.tsx
│   ├── projects/             ProjectExplorer.tsx
│   ├── ask/                  AskWesley.tsx
│   ├── shell/                Nav.tsx, Footer.tsx
│   └── ui/                   primitives.tsx (SectionHeader, Reveal, Counter, ChartTooltip…)
├── data/                     ← the only place content lives
│   ├── profile.json  experience.json  projects.json  certifications.json
│   ├── publications.json  skills.json  visualizations.json
├── lib/
│   ├── types.ts              domain model
│   ├── data.ts               typed accessors (the "API")
│   ├── analytics.ts          every derived KPI
│   ├── timeline.ts           durations, ordering
│   ├── graph.ts              skill-network layout
│   ├── ask-engine.ts         Ask Wesley AI retrieval engine
│   ├── mini-sql.ts           SQL engine for the terminal
│   ├── viz.ts                Tableau URL helpers + lazy API loader
│   └── utils.ts              cn(), asset() for basePath, colour maps
├── styles/globals.css        design tokens + component classes
└── types/tableau.d.ts        JSX typing for <tableau-viz>
public/
├── lab/<app>/                4 self-contained command-center apps + poster.png
├── powerbi/<report-id>/      (add exported page PNGs here)
├── resume.pdf
└── .nojekyll
.github/workflows/deploy.yml  CI → GitHub Pages
```

## 4. Component hierarchy

```
RootLayout
├── Nav ──────────── openAsk() event
├── <main>
│   └── Home
│       ├── Hero ─────────────── BrainScene (dynamic, ssr:false, WebGL-detected)
│       ├── ExecutiveDashboard ─ Counter ×6, AreaChart, BarChart
│       ├── CareerTimeline ───── Gantt rows → Detail panel (AnimatePresence)
│       ├── SkillNetwork ─────── SVG graph (buildSkillGraph) + Evidence aside
│       ├── ImpactStories ────── Story rail → Story modal
│       ├── AnalyticsLab ─────── Platform tabs → list → VizEmbed
│       ├── CertRoadmap ──────── Track lanes (desktop) / list (mobile)
│       ├── PersonalAnalytics ── Wrapped story card + 4 ChartCards
│       ├── Terminal ─────────── runSql(), ask(), ResultTable
│       ├── Manifesto ────────── ManifestoLine × n (useScroll)
│       └── ContactHub
├── Footer
└── AskWesley ─────────── ask() / optional endpoint → AiBubble

VizEmbed (shared by AnalyticsLab and DashboardGallery)
├── TableauFrame   → Poster → loadTableauApi() → <tableau-viz>
├── PowerBIFrame   → iframe (embedUrl) | page gallery (screenshots) | report card
└── PrototypeFrame → Poster(poster.png) → sandboxed iframe
```

## 5. Data model

All types are in `src/lib/types.ts`. Relationships:

```
Profile 1 ── * Experience ── * Metric
                  │ id
Skill * ──────────┤ evidence[] references Experience.id, project keys, "research", "certs"
                  │
Project (48, from GitHub)        Certification (status: earned | in-progress | target)
Publication                      Visualization = TableauViz | PowerBIViz | PrototypeViz
```

Rules that keep the site honest:
- **No hand-typed totals.** KPI tiles, the Wrapped card and the charts come from `lib/analytics.ts`.
- **Before/after metrics use working hours** (1 day = 8 h), so "4 days → 3 h" is shown as 32 h → 3 h, −91 %.
- **Skill depth is labelled as a self-assessment**; the evidence list is what a reader can verify.
- **Certification targets are marked "target"**, never "earned".

## 6. API structure

GitHub Pages is static, so the "API" is a build-time module boundary, designed to be swapped for HTTP later without touching components:

| Endpoint (today: function) | Returns | Future HTTP equivalent |
|---|---|---|
| `data.profile` | `Profile` | `GET /api/profile` |
| `data.experience` | `Experience[]` | `GET /api/experience` |
| `data.projects` | `Project[]` | `GET /api/projects` (or GitHub REST at build) |
| `data.certifications` | `Certification[]` | `GET /api/certifications` |
| `data.visualizations` | `Visualization[]` | `GET /api/visualizations` |
| `analytics.kpis()` etc. | derived metrics | `GET /api/metrics` |
| `askEngine.ask(q)` | `{ text, bullets, sources }` | `POST /api/ask` |
| `miniSql.runSql(q)` | `{ columns, rows, ms }` | `POST /api/sql` |

**Ask Wesley AI** runs entirely in the browser (`lib/ask-engine.ts`): intent detection for the common questions (Power BI, SQL, certifications, approach, Tableau, contact, research, skills) plus keyword-scored retrieval over every record. Zero cost, zero latency, no server and no API key — and it can't make things up, because every sentence comes from `/src/data`.

## 7. Design system

**Concept:** a control room. Dark ink surfaces, hairline borders, monospace labels — the vocabulary of BI tools — with one gradient reserved for the words that matter.

| Token | Value | Use |
|---|---|---|
| `--ink` / `-2` / `-3` | `#07090D` / `#0D1118` / `#141A24` | page / panel / hover |
| `--line` | `#242C3A` | hairlines, grid |
| `--fg` / `-muted` / `-faint` | `#E8ECF3` / `#94A0B4` / `#5C687C` | text hierarchy |
| `--signal` | `#5EEAD4` | data, primary actions |
| `--synapse` | `#A78BFA` | AI, research |
| `--ledger` | `#FBBF24` | finance, money |
| `--alert` | `#FB7185` | risk, anomalies |

Colour is semantic: amber always means money, violet always means AI.

- **Type:** Geist Sans (display + body, tight tracking on headlines), Geist Mono (labels, numbers, code). Eyebrows are 11 px mono, uppercase, +0.18 em.
- **Components** (`globals.css`): `.panel`, `.chip`, `.btn-primary`, `.btn-ghost`, `.eyebrow`, `.h-display`, `.h-section`, `.text-gradient`.
- **Layout:** 1240 px container, 16 px gutters on mobile, sections 96–128 px apart, every chapter numbered `01–10`.
- **Charts:** Recharts with no axis lines, dashed horizontal grid, mono ticks, one shared dark tooltip.

## 8. Animation strategy

Motion explains, it doesn't decorate. Three tiers:

| Tier | What | How |
|---|---|---|
| **Ambient** | Brain rotation, synapse pulses, live dots | R3F `useFrame`, CSS keyframes. Always subtle. |
| **Entrance** | Sections rise in once; counters count up; Gantt bars grow; graph nodes spring in | Framer `whileInView` + `viewport.once` — never replays on scroll back |
| **Response** | Tab underline (`layoutId`), role detail swap, story modal, Wrapped progress | `AnimatePresence`, springs (stiffness 300–400) |

Scroll-linked: the hero parallaxes out and the manifesto lights line-by-line (`useScroll` + `useTransform`).

Performance & accessibility:
- The 3D scene is `dynamic(..., { ssr: false })`, skipped when WebGL is unavailable **or** `prefers-reduced-motion` is set (a static glow replaces it). DPR capped at 1.75.
- `Reveal` and `Counter` read `useReducedMotion()` and jump to the final state.
- BI embeds are click-to-load; nothing third-party loads on first paint.
- Only `transform`/`opacity` are animated.

## 9. GitHub Pages deployment plan

1. Create the repo. For the root URL `https://wesleyharuo.github.io/`, name it **`wesleyharuo.github.io`**. Any other name deploys to `https://wesleyharuo.github.io/<repo>/` — the workflow handles the base path automatically.
2. Push this project to `main`.
3. Repo → **Settings → Pages → Source: GitHub Actions**.
4. The workflow (`.github/workflows/deploy.yml`) runs `npm ci` → `next build` (static export to `out/`) → uploads → deploys. `actions/configure-pages` supplies the correct `NEXT_PUBLIC_BASE_PATH`.
5. Optional: Settings → Pages → custom domain; the base path becomes empty automatically.

Why it works on Pages: `output: "export"`, `trailingSlash: true` (Pages serves `/dashboard/index.html`), `images.unoptimized`, `.nojekyll` (so `_next/` isn't stripped), and `asset()` prefixes every raw `/public` path with the base path.

## 10. Power BI and Tableau — how the visualizations get in

One component, `VizEmbed`, one data file, `visualizations.json`. Adding a report never touches JSX.

### Tableau Public (live today)

- Uses the official **Tableau Embedding API v3** web component, `<tableau-viz src="https://public.tableau.com/views/<workbook>/<view>">`.
- The API script (~300 KB) loads **only when the visitor presses play**; before that a poster shows the real thumbnail from `public.tableau.com/thumb/views/<workbook>/<view>`.
- To add a viz: publish to Tableau Public, copy `<workbook>/<view>` from its URL, add an entry:

```json
{ "id": "tab-new", "platform": "tableau", "title": "…", "description": "…",
  "domain": "…", "tags": ["Tableau Public"], "workbook": "MyWorkbook", "view": "Dashboard1", "featured": true }
```

### Power BI (three levels, pick per report)

`.pbip` files are source projects — a browser can't render them. The site supports three ways to show them, in order of preference:

| Level | What the visitor gets | What you do | Field |
|---|---|---|---|
| **A. Live embed** | Fully interactive report in an iframe | In Power BI Service: *File → Embed report → Publish to web (public)* → copy the `https://app.powerbi.com/view?r=…` link | `embedUrl` |
| **B. Page gallery** | Swipeable images of each report page | In Power BI Desktop: *File → Export → PDF*, or screenshot each page at 1600×900 → save as `public/powerbi/<id>/p1.png…` | `screenshots: ["/powerbi/<id>/p1.png", …]` |
| **C. Report card** | Title, file name, honest "live embed coming soon" | Nothing — the default | — |

Notes on level A:
- *Publish to web* needs a Power BI account whose tenant allows it (check the current licence requirements in Microsoft's docs — a work or school account is required, not a personal Gmail/Hotmail). It makes the report **public to anyone with the link** — fine for Statistics Canada data, never for client data.
- Statistics Canada data refreshes on the Service schedule, so the embedded report stays current without redeploying the site.
- If Publish to web isn't available to you, level B is the fallback — it still looks native on the site.

### Interactive apps

The four command-center apps (Document Intelligence, Integration, Inventory & Freight, Tenant Lifecycle) are self-contained HTML in `public/lab/`. They load in a sandboxed iframe after a poster click, with a full-screen link. Each links to its GitHub repo.

---

## Running locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export in ./out
npx serve out      # preview the export
```
