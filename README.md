# Unified Campus Safety & Operational Intelligence Platform

> Public Safety for Higher Education — Unified Data Hub (UDH) POC

A frontend-only React proof-of-concept demonstrating how the fragmented public-safety apparatus of a US university — CAD/RMS, access control, surveillance, mass notification, behavioral threat assessment, residential life, transportation, facilities IoT, student information systems, conduct case management, Title IX, and Clery compliance — can be unified into one governed platform with AI-assisted exploration.

Built around the **Medallion Architecture** (Bronze / Silver / Gold). All screens wired end-to-end against rich mock data; no backend, no real LLM, no auth. Positioned as a 12-week build with three internally-consistent narrative threads.

> **Position:** This is **not** a campus-security dashboard. It is the **operating system for a university's public-safety apparatus** — unifying twenty vendor systems into one governed, real-time, AI-assisted platform.

## Current status

**R0 (Foundation) shipped.** The scaffold renders, the role switcher reshapes the UI, seed mocks flow through the mock-db swap-point, theme tokens carry the 10-tier classification scale, and the AppShell is in place.

See [`docs/implementation-plan.md`](./docs/implementation-plan.md) for the phase plan (R0 → R10).

## Quickstart

```bash
npm install
npm run dev         # Vite dev server at http://localhost:5173
npm run typecheck   # strict TS — the only automated gate
npm run build       # tsc -b && vite build (production output to dist/)
npm run preview     # preview the production build
```

## What's in this repo right now (R0)

```
docs/                                  # spec, implementation plan, capabilities summary
mocks/                                 # seed fixtures (regions, buildings, residence halls, beats)
src/
  main.tsx                             # router root with Home + NotFound
  styles/globals.css                   # Tailwind v4 @theme tokens
  routes/
    home.tsx                           # Command Center foundation
    not-found.tsx                      # placeholder for unbuilt routes
  components/
    ui/                                # button, card, badge, input, separator, skeleton
    layout/                            # app-shell, sidebar, header, page-header, role-switcher
  lib/
    types/index.ts                     # type catalog §1–§7 stubbed
    mock-db/index.ts                   # sole import surface
    role-context.tsx                   # 9 personas with classification scoping
    time.ts                            # ANCHOR + relative-time helpers
    seed.ts                            # mulberry32 RNG
    geo.ts                             # GeoPoint/GeoPolygon kit
    utils.ts                           # cn, formatters, sleep
```

## What lands next

| R | Week | What ships |
|---|---|---|
| R0 | 1 | **Foundation (here)** |
| R1 | 2 | Medallion catalog (~45 datasets), source registry, pipelines, six-dim DQ console |
| R2 | 3 | Pipeline live-run state machine + 8-step Source Onboarding Wizard |
| R3 | 4 | Person 360 + Incident 360 + identity-resolution graph → **Phase 1 demo** |
| R4 | 5 | MapLibre campus basemap + Building intelligence |
| R5 | 6 | Thread A (BIT case briefing AI moment) |
| R6 | 7 | Thread B (EOC tornado activation) |
| R7 | 8 | Thread C (Clery ASR workbench) → **Phase 2 demo (all three threads)** |
| R8 | 9 | Module 5B Student Conduct depth + Governance + audit-of-audit |
| R9 | 10–11 | Polish, 7 AI surfaces, 7 copilots, demo script |
| R10 | 12 | Ship — production build + AWS Amplify deploy |

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
