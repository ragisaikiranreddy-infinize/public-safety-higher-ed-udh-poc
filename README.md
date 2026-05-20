# Unified Campus Safety & Operational Intelligence Platform

> Public Safety for Higher Education — Unified Data Hub (UDH) POC

A frontend-only React proof-of-concept demonstrating how the fragmented public-safety apparatus of a US university — CAD/RMS, access control, surveillance, mass notification, behavioral threat assessment, residential life, transportation, facilities IoT, student information systems, conduct case management, Title IX, and Clery compliance — can be unified into one governed platform with AI-assisted exploration.

Built around the **Medallion Architecture** (Bronze / Silver / Gold). All screens wired end-to-end against rich mock data; no backend, no real LLM, no auth. Positioned as a 12-week build with three internally-consistent narrative threads.

> **Position:** This is **not** a campus-security dashboard. It is the **operating system for a university's public-safety apparatus** — unifying twenty vendor systems into one governed, real-time, AI-assisted platform.

## Current status

**R10 (Ship) — production cut complete.** All ten R-phases shipped. The platform demos end-to-end across all three threads (BIT · EOC · Clery), 9 personas with role-aware governance, ⌘K command palette, 25-second live-ping demo moment, and an 18-minute scripted walkthrough. Production build: **2,003 modules → 2.21 MB JS / 594 KB gzip, zero warnings**. All three release-gate greps return empty.

See [`docs/phase-summaries.md`](./docs/phase-summaries.md) for the R0–R10 phase log, [`docs/demo-script.md`](./docs/demo-script.md) for the rehearseable walkthrough, and [`docs/ship-checklist.md`](./docs/ship-checklist.md) for the release-gate walk.

## Quickstart

```bash
npm install
npm run dev         # Vite dev server at http://localhost:5173
npm run typecheck   # strict TS — the only automated gate
npm run build       # tsc -b && vite build (production output to dist/)
npm run preview     # preview the production build
```

## What's in this repo (R10)

```
docs/                                  # spec, plan, capabilities, phase-summaries,
                                       # demo-script, ship-checklist
mocks/                                 # ~50 fixture files (BIT, EOC, Clery, governance, AI surfaces …)
src/
  main.tsx                             # router root — ~70 routes wired across R0–R9
  styles/globals.css                   # Tailwind v4 @theme tokens (10-tier classification palette)
  routes/                              # ~55 page files
  components/
    ui/                                # button, card, badge, input, separator, skeleton, tabs, label
    layout/                            # app-shell, sidebar, header, role-switcher, page-header,
                                       # command-palette (⌘K), notifications-bell, theme-toggle
    data-display/                      # badges, chips, indicators (8 components)
    map/                               # MapLibre campus map
    lineage/                           # xyflow lineage graph
    identity/                          # xyflow identity-resolution graph
    incident/                          # incident-timeline, units-lane
    person/                            # person-header-card, classification-banner
    bit/                               # briefing-card (7-bullet AI), risk-gauge, contributors-feed
    eoc/                               # common-operating-picture, ics-grid, situation-log, decision-log
    clery/                             # asr-grid, geography-editor, classification-card
    conduct/                           # case-board, sanction-tracker, amnesty-panel,
                                       # parental-notif-decision-aid
    ai-surfaces/                       # dashboard-grid (stagger reveal), cohort-chip-pipeline, insight-card
  lib/
    types/index.ts                     # type catalog §1..§21 complete
    mock-db/index.ts                   # sole import surface
    ai/mock-ai.ts                      # sole AI swap-point — 12 functions R5–R9
    role-context.tsx                   # 9 personas, classification masking, R8 split sidebar
    information-barriers.ts            # 12 barriers + evaluator + subscribable hit log
    time.ts                            # ANCHOR + relative-time helpers
    seed.ts                            # mulberry32 RNG
    geo.ts                             # GeoPoint/GeoPolygon kit
    source-store.ts                    # wizard-registered sources
    notification-store.ts              # 25s live-ping demo timer
    utils.ts                           # cn, formatters, sleep
```

## Phase log (R0–R10)

| R | Week | What ships | Status |
|---|---|---|---|
| R0 | 1 | Foundation — scaffold + role switcher + seed mocks | ✅ |
| R1 | 2 | Medallion catalog (45 datasets), source registry, pipelines, six-dim DQ | ✅ |
| R2 | 3 | Pipeline live-run state machine + 8-step Source Onboarding Wizard | ✅ |
| R3 | 4 | Person 360 + Incident 360 + identity-resolution graph → **Phase 1 demo** | ✅ |
| R4 | 5 | MapLibre campus basemap + Building intelligence | ✅ |
| R5 | 6 | Thread A — BIT case briefing AI moment | ✅ |
| R6 | 7 | Thread B — EOC tornado activation | ✅ |
| R7 | 8 | Thread C — Clery ASR workbench → **Phase 2 demo (all three threads)** | ✅ |
| R8 | 9 | Module 5B Student Conduct depth + Governance + sidebar split | ✅ |
| R9 | 10–11 | Polish · ⌘K palette · live ping · AI surfaces · demo script | ✅ |
| R10 | 12 | Ship — production build · Amplify-ready · ship-checklist gate | ✅ |

## Three demo threads

The POC tells three internally consistent stories that weave across 5–8 screens each.

- **Thread A — "The Pattern That Was Already There"** — Behavioral threat assessment hero. The CARE team coordinator opens a subject's BIT case; the AI assembles a 7-bullet briefing from 6 months of multi-source signal that no single human ever saw together. NaBITA risk classification returns "elevated, trending high." The Title IX intake is surfaced as a barrier-hit without breaching content.
- **Thread B — "The Storm"** — EOC operational intelligence hero. NWS tornado warning lands; EOC auto-activates Level 2; mass notification fires; shelter buildings unlock; one building's generator fails to start; the platform surfaces it in 90 seconds and the EOC redirects students with a follow-up campaign.
- **Thread C — "The Clery Audit"** — Compliance hero. The Clery Compliance Officer opens the 2025 ASR workbench; every cell shows source-to-line lineage; the geography editor explains polygon classification with audit trail; FERPA-aware FOIA redaction generates a DOE-reviewer-ready packet.

## Documentation

- [`docs/public-safety-higher-education-udh-spec.md`](./docs/public-safety-higher-education-udh-spec.md) — the spec (~14K words, 20 sections, the full capability + entity + thread + compliance picture)
- [`docs/implementation-plan.md`](./docs/implementation-plan.md) — phase plan, default decisions, ID conventions, mock fixture targets, AI surface contract, pitfalls library
- [`docs/capabilities-summary.md`](./docs/capabilities-summary.md) — quick-reference index of capabilities, AI surfaces, copilots, regulations, personas
- [`CLAUDE.md`](./CLAUDE.md) — working contract for contributors

## Architectural invariants (per CLAUDE.md)

The four sacrosanct swap-points:

1. **`src/lib/mock-db/index.ts`** — sole import surface for `/mocks/*`
2. **`src/lib/ai/mock-ai.ts`** (R5+) — sole AI swap-point
3. **`src/lib/role-context.tsx`** — sole auth + RBAC + classification swap-point
4. **`mocks/threads.ts`** (R2+) — sole anchor-ID surface for cross-narrative threads

Replace those four files to swap to a real backend / real LLM / real auth. Nothing else changes.

## License

POC artifact. Not licensed for external distribution.
