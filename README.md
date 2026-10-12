# Inside Wesley's Data Brain

An immersive, data-driven personal platform for **Wesley Haruo Kurosawa da Silva** — Data Analyst, Greater Toronto Area.

Next.js 15 · React 19 · TypeScript · Tailwind · Framer Motion · Three.js / React Three Fiber · Recharts · Lucide · static export to GitHub Pages.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # → ./out (static)
```

**Edit content, not code:** everything on the site comes from `src/data/*.json`.

| To… | Edit |
|---|---|
| Add a job or a result | `src/data/experience.json` |
| Add a certification | `src/data/certifications.json` (`status`: earned · in-progress · target) |
| Add a Tableau viz or Power BI report | `src/data/visualizations.json` — see ARCHITECTURE.md §10 |
| Refresh repositories | `src/data/projects.json` |
| Change the skill graph | `src/data/skills.json` |

Live at **https://wesleyharuo.github.io/about/** (the previous portfolio stays at `/about/classic/`).

Deploy: push to `main`. One-time setup: **Settings → Pages → Build and deployment → Source → GitHub Actions**. Full plan, design system and architecture: [ARCHITECTURE.md](./ARCHITECTURE.md).
