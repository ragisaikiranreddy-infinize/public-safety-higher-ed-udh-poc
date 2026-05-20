# CLAUDE.md

This file is the working contract for Claude Code (claude.ai/code) when editing this repository. User-facing summary in [README.md](./README.md); this file is the contributor contract.

## Status: R10 (Ship) — production cut complete

All ten R-phases shipped. The platform demos end-to-end across all three threads (BIT · EOC · Clery) with role-aware governance, the ⌘K command palette, a 25-second live-ping demo moment, an 18-minute scripted walkthrough ([`docs/demo-script.md`](./docs/demo-script.md)), and an AWS Amplify-ready production build (2.21 MB JS / 594 KB gzipped, **zero warnings**). The four sacrosanct swap-points hold, all three release-gate greps return empty, and the phase log in [`docs/phase-summaries.md`](./docs/phase-summaries.md) carries R0 through R10 entries.

**What's still operator-side (not codeable from this repo):**

1. AWS Amplify deploy — push the branch, then add the SPA rewrite rule in the console: `Source: /<*> · Target: /index.html · Type: 404→200 Rewrite`. Verify deep-links by hitting `/incidents/INC-2026-04881` on the deployed URL.
2. Presenter rehearsal × 2 with stopwatch against the demo script. Bug-list closure before the live demo.

See [`docs/ship-checklist.md`](./docs/ship-checklist.md) for the spec §18 release-gate walk-through with current pass/notes.

Source-of-truth documents (in precedence order):

1. [`docs/public-safety-higher-education-udh-spec.md`](./docs/public-safety-higher-education-udh-spec.md) — the spec (capabilities, entities, demo threads)
2. [`docs/implementation-plan.md`](./docs/implementation-plan.md) — phase plan (R0 → R9), default decisions, conventions, pitfalls
3. [`docs/capabilities-summary.md`](./docs/capabilities-summary.md) — quick-reference index
4. This file — rules and pitfalls a new contributor must follow

If two files disagree, fix the lower-precedence file. Never silently diverge.

## Tech stack (pinned versions in `package.json`)

- React 19 + Vite 6 + TypeScript 5.7 (strict, `noUnusedLocals`, `noUnusedParameters`)
- React Router v7 (data router via `createBrowserRouter`)
- Tailwind v4 (CSS-first; tokens in `@theme inline {}` inside `src/styles/globals.css`)
- shadcn-style UI primitives (Radix + CVA + tw-merge + clsx) — hand-written, no shadcn CLI
- `lucide-react` icons (1.5–1.75 stroke)
- Recharts, `@xyflow/react` v12, `@tanstack/react-table` v8
- `react-hook-form` + `zod` (forms)
- MapLibre GL + `react-map-gl` + `@turf/turf` (campus map, R4)
- Map tiles from OpenFreeMap (no API key)
- Path alias: `@/` → `./src/`

## Commands

- `npm install` — bootstrap (Node ≥ 20, npm ≥ 10)
- `npm run dev` — Vite at http://localhost:5173
- `npm run typecheck` — `tsc --noEmit -p tsconfig.app.json`. **The only automated gate** (no test runner, no lint script).
- `npm run build` — `tsc -b && vite build`, production output to `dist/`
- `npm run preview` — serve the built bundle locally
- Deploy — pushed branches build via [`amplify.yml`](./amplify.yml) on AWS Amplify (SPA rewrite required, see Pitfall #10)

**Release gates (manual, run before tagging a release):**

```bash
rg "20\d{2}-\d{2}-\d{2}" src mocks --glob '!time.ts'   # must return empty
rg "from ['\"]\.\.?/?mocks" src                         # must return empty (mock-db is the sole import surface)
```

## Architectural rules (the four sacrosanct swap-points)

1. **`src/lib/mock-db/index.ts`** is the **sole import surface for `/mocks/*`**. Routes/components import via `@/lib/mock-db`, never `'../../mocks/*'` or `'../mocks/*'`. Grep-enforced at release.
2. **`src/lib/ai/mock-ai.ts`** (lands in R5) is the **sole AI swap-point**. No route imports an LLM SDK directly.
3. **`src/lib/role-context.tsx`** is the **sole auth + RBAC + classification swap-point**. Components use `useRole()` + `canSee(classification)` — they don't evaluate classification on their own.
4. **`mocks/threads.ts`** (lands in R2) is the **sole anchor-ID surface** for the three cross-narrative demo threads. Routes/AI reference `THREAD_A_SUBJECT_PERSON_ID` etc., never hardcoded strings.

## Time-anchor discipline (the non-negotiables)

1. `ANCHOR = new Date()` in `src/lib/time.ts` is set once at module load, pinned to **14:00 campus-local**.
2. **No hardcoded ISO date strings** anywhere outside `src/lib/time.ts`. Release-gate grep:
   ```bash
   rg "20\d{2}-\d{2}-\d{2}" src mocks --glob '!time.ts'   # must return empty
   ```
3. **Narrative copy uses relative phrases only** — "yesterday", "past 3 hours", "this semester", "the last 14 days". Never weekdays, month names, quarters, or absolute dates.
4. **SQL in canned AI** (R5+) uses `CURRENT_DATE - INTERVAL 'N days'` — never literal dates.
5. **Procedural time-series is seeded via `src/lib/seed.ts`** with namespace `+ ANCHOR.dayOfYear`. Stable within a session, refreshes on a new demo day.

## Folder structure

This is the **actual tree as of R10**. Every folder below is committed.

```
public-safety-higher-education-poc/
├── docs/                              spec, implementation-plan, capabilities, phase-summaries,
│                                       demo-script, ship-checklist
├── mocks/                             ~50 fixture files — never imported directly by routes
├── src/
│   ├── main.tsx                       route tree (~70 routes across R0–R9)
│   ├── vite-env.d.ts                  vite/client ambient types
│   ├── styles/globals.css             Tailwind v4 @theme inline tokens
│   ├── routes/                        one file per page (~55 files)
│   ├── components/
│   │   ├── ui/                        shadcn-style primitives (button, card, badge, …)
│   │   ├── layout/                    app-shell, sidebar, header, role-switcher, page-header,
│   │   │                                  command-palette, notifications-bell, theme-toggle
│   │   ├── data-display/              badges, chips, indicators
│   │   ├── map/                       MapLibre campus map
│   │   ├── lineage/                   xyflow lineage graph
│   │   ├── identity/                  xyflow identity-resolution graph
│   │   ├── incident/                  incident-timeline, units-lane
│   │   ├── person/                    person-header, barrier-indicator
│   │   ├── bit/                       briefing-card, risk-gauge, contributors-feed
│   │   ├── eoc/                       common-operating-picture, ics-grid, situation-log, decision-log
│   │   ├── clery/                     asr-grid, geography-editor, classification-card
│   │   ├── conduct/                   case-board, sanction-tracker, amnesty-panel, parental-notif-decision-aid
│   │   └── ai-surfaces/               dashboard-grid (stagger reveal), cohort-chip-pipeline, insight-card
│   └── lib/
│       ├── types/index.ts             single source of truth — §1..§21 sectioned
│       ├── mock-db/index.ts           sole import surface for /mocks/*
│       ├── ai/mock-ai.ts              sole AI swap-point — 12 functions across R5–R9
│       ├── time.ts                    ANCHOR + relative helpers
│       ├── seed.ts                    mulberry32 + namespaced RNG
│       ├── geo.ts                     GeoPoint/GeoPolygon math
│       ├── role-context.tsx           9 personas, classification masking, R8 split sidebar
│       ├── information-barriers.ts    12 barriers + evaluator + subscribable hit log
│       ├── source-store.ts            useSyncExternalStore for wizard-registered sources
│       ├── notification-store.ts      useSyncExternalStore + 25s live-ping demo timer
│       └── utils.ts                   cn, formatters, sleep
└── package.json, tsconfig*.json, vite.config.ts, amplify.yml, index.html
```

## ID conventions

String FKs throughout. Format: `PREFIX-` + identifier.

| Entity | Prefix | Example |
|---|---|---|
| Building | `BLD-` | `BLD-CARTER-HALL` |
| Residence Hall | `RES-` | `RES-CARTER-HALL` |
| Beat | `BEAT-` | `BEAT-CENTRAL` |
| Person | `PER-` | `PER-008470` |
| Officer | `OFC-` | `OFC-0124` |
| Incident | `INC-YYYY-` | `INC-2026-04881` |
| Case | `CASE-YYYY-` | `CASE-2026-00917` |
| BIT case | `BIT-YYYY-` | `BIT-2026-0067` |
| Title IX case | `TIX-YYYY-` | `TIX-2026-0014` |
| Conduct case | `COND-YYYY-` | `COND-2026-00417` |
| Sanction | `SNC-` | `SNC-2026-00417-A` |
| EOC activation | `EOC-YYYY-` | `EOC-2026-013` |
| Camera | `CAM-` | `CAM-CARTER-N3` |
| Door | `DOR-` | `DOR-CARTER-MAIN-S` |
| Notification campaign | `MNP-` | `MNP-2026-088` |
| Dataset | `<source>.<entity>_<state>` | `cad.events_raw` |
| Pipeline | `<layer>-<purpose>` | `bronze-cad-events` |
| Source | `SRC-<vendor>-<scope>` | `SRC-MARK43-CAD-PRIMARY` |

Full table in [`docs/implementation-plan.md`](./docs/implementation-plan.md).

## Pitfalls library

1. **`useSyncExternalStore` snapshot caching.** Every store must cache `_snapshot` in module scope and rebuild only on mutation; otherwise React infinite-loops.
2. **xyflow v12 node-data types.** Custom node data must extend `Record<string, unknown>` via intersection.
3. **Recharts KPI sparkline sizing.** Use fixed pixel heights (`h-[56px]`, `h-[72px]`) — never `flex-1` with `height="100%"`.
4. **Dashboard widget span.** `md:col-span-*` goes on the **grid-item wrapper**, not the inner `<Card>`.
5. **MapLibre + setInterval cleanup.** Always pair with `cancelled` flag + `clearInterval` in cleanup. Critical for the campus map, pipeline live-run, notification live-ping.
6. **No `/mocks/*` imports outside mock-db.** Release-gate grep enforces it.
7. **No hardcoded ISO dates outside `time.ts`.** Release-gate grep enforces it.
8. **Tailwind v4 is CSS-first.** No `tailwind.config.js` — tokens live in `@theme inline {}` inside `globals.css`.
9. **Path alias.** Always `@/` (configured in both `vite.config.ts` and `tsconfig.app.json`).
10. **AWS Amplify SPA rewrite.** After first deploy, add `/<*> → /index.html` 404→200 rule in the Amplify console — otherwise deep-links 404.
11. **Information-barrier evaluation is in the data layer, not the UI.** A component can't decide whether to render Title IX content; the mock-db helper applies the barrier first.
12. **Map building polygons must be closed.** First and last GeoPoint of each polygon array must match exactly.
13. **Procedural data is seeded.** Never use `Math.random()` directly in fixture builders; always via `rng(namespace)`.
14. **Pin major versions for map and charts.** `react-map-gl` stays on v7.x (v8 changes the prop API for sources/layers); `recharts` stays on v2.x (v3 ships breaking changes to axis and tooltip APIs). Bumping either is a deliberate migration, not a routine `npm update`.
15. **Do not run the shadcn CLI.** Primitives in `src/components/ui/` are hand-written variants tuned to the 10-tier classification token palette. The CLI will overwrite them with stock versions and silently break role-scoped styling.
16. **Date-grep regex caveat.** The release-gate `20\d{2}-\d{2}-\d{2}` is safe against current ID schemes (e.g., `INC-2026-04881`) because the middle group requires exactly 2 digits. If a new ID scheme introduces `YYYY-MM-DD`-shaped suffixes, tighten the regex with a leading word boundary before tagging the release.

## Conventions checklist (CI-grade rules, even without CI)

- One file per route. Default export. Filename = kebab-case of route.
- `<PageHeader eyebrow title description actions>` at the top of every route.
- Body sections inside `<Card>` with `space-y-6 px-8 py-6`.
- String FKs only. No surrogate ints. Union types, no TS enums.
- Every searchable entity has a `/:id` detail page. The ⌘K palette (R9) must not surface dead links.
- No `Math.random()` outside `seed.ts`. Use `rng(namespace)`.
- Component naming: PascalCase for components; kebab-case for files; `use*` for hooks; `*Store` for stores.
- No business logic in components — compute in mock-db helpers, render in components.

## Out of scope (for the 12-week POC)

Real LLM · real auth · real ingestion · real video · real radio · real NCIC · real mass-notification dispatch · mobile · CJIS-certified deployment · multi-tenancy enforcement · backend write paths · real persistence beyond in-memory.

Deferred and tracked in [`docs/implementation-plan.md`](./docs/implementation-plan.md): Pipeline Template Library, dedicated Observability Dashboard, in-UI pipeline-create wizard, Pipeline IDE.

## Phase plan at a glance

| R | Week | What ships | Status |
|---|---|---|---|
| R0 | 1 | Foundation (scaffold + role switcher + seed mocks) | ✅ |
| R1 | 2 | Catalog + Lineage spine | ✅ |
| R1.5 | between | Sidebar Data widening for Clery / BIT / EOC personas | ✅ (hotfix) |
| R2 | 3 | Pipeline live-run + Source onboarding wizard | ✅ |
| R3 | 4 | Person 360 + Incident 360 + identity resolution → **Phase 1 demo** | ✅ |
| R4 | 5 | Campus map + Building intelligence | ✅ |
| R5 | 6 | Thread A (BIT) end-to-end | ✅ |
| R6 | 7 | Thread B (EOC tornado) end-to-end | ✅ |
| R6.5 | between | Command Center KPI rewire (R0 tech debt) | ✅ (hotfix) |
| R7 | 8 | Thread C (Clery ASR) end-to-end → **Phase 2 demo (all three threads)** | ✅ |
| R8 | 9 | Module 5B Conduct depth + Governance + Data-group split | ✅ |
| R9 | 10–11 | Polish · copilots · AI surfaces · ⌘K palette · demo script | ✅ |
| R10 | 12 | Ship — production build · Amplify deploy · ship-checklist gate | ✅ |

## When the repo grows new structure

Update this file alongside the change. The sections that must stay accurate to what's actually committed: **tech stack versions**, **folder structure**, **phase-plan row for the current R**, and **pitfalls**. Swap-point invariants, time-anchor rules, and ID conventions are sticky — change them only with explicit cross-doc review.
