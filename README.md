# Trajectory

Trajectory is a reflection and personal analytics product that helps turn short daily observations into careful weekly and longer-term decisions without treating correlation as causation.

> **About this public edition:** This repository contains an interactive demo edition of Trajectory. It uses synthetic data, stores everything locally in IndexedDB, and requires no account. The production product is developed separately and is currently in closed beta with invite-only registration.

**[Open the interactive demo](https://dmitryaf.github.io/trajectory/)**

![Trajectory weekly reflection](docs/screenshots/trajectory-week-review.png)

**Vue 3 · TypeScript · Pinia · Dexie · ECharts · PWA**

The core flow stays intentionally small: record what mattered today, review a completed week, inspect longer-term patterns, and choose a useful next step. Every field is optional, and incomplete data remains visible rather than being filled with assumptions.

## Why Trajectory

It is easy to remember a whole week by its last or strongest feeling. Trajectory places daily notes, completed work, important events, and wellbeing next to each other. Every comparison shows how many records it uses, and the app never presents a coincidence as a proven cause.

```mermaid
flowchart LR
    A[Daily observations] --> B[Weekly reflection]
    B --> C[Longer-term patterns]
    C --> D[Next decisions]
```

## How it works

- **Today:** record sleep, energy, daily conditions, actions, life areas, and one short note. Every field is optional.
- **Week:** see the recorded days, completed work, important events, unusual days, and one decision for the next week.
- **History:** follow important events and decisions, view monthly values, and compare equal periods before and after an event.

## Engineering highlights

- **Local data.** Pinia manages application state, while Dexie keeps edits in IndexedDB across reloads.
- **Clear code boundaries.** Import rules keep data normalization, application flows, Vue components, calculations, and storage separate.
- **Calculations separate from charts.** Plain TypeScript modules build summaries and comparisons; Vue and ECharts only display them.
- **Missing data stays missing.** Calculations keep gaps, record counts, incomplete periods, and unusual days visible.
- **Offline-ready PWA.** The app supports local data, service-worker updates, route-level loading, and recovery after an outdated deployment.
- **Repeatable demo data.** The app, automated tests, and screenshots use the same fixed data generator.

## Product walkthrough

### Today

The mobile-first entry keeps the current week visible while allowing the user to record only the observations that matter that day.

<p align="center">
  <img src="docs/screenshots/trajectory-today-mobile.png" alt="Trajectory daily entry on mobile" width="390" />
</p>

### Week

The weekly view places recorded days, completed work, important events, and a few careful observations on one screen.

![Trajectory weekly review with coverage and reflection cues](docs/screenshots/trajectory-week-review.png)

### Next decision

The review shows the previous decision and what happened afterwards. The user can then save one next step and an optional “if–then” plan.

![Trajectory weekly decision and if-then plan](docs/screenshots/trajectory-week-decision.png)

### History

History shows monthly values together with the number of records used. It marks incomplete periods and does not claim that an event caused a change.

![Trajectory change history and monthly sleep trend](docs/screenshots/trajectory-trends.png)

## Architecture

```text
Vue views and components
          ↓
Application features
          ↓
Domain model and analytics
          ↓
Dexie local persistence
```

See [the architecture overview](docs/architecture.md) for module responsibilities and the public repository boundary.

## Explore the code

- [Data normalization](src/model/normalization.ts) keeps old records compatible and preserves missing values.
- [Analytics modules](src/features/analytics) keep calculations separate from the interface.
- [Dexie schema](src/db.ts) and [application store](src/stores/app.ts) show how local data is stored.
- [Daily-entry feature](src/features/daily-entry) contains the flow for short daily records.
- [Demo feature](src/features/demo) and [data generator](scripts/generate-demo-data.mjs) create the same validated starting data every time.

## Local data and reset

On first launch, the app adds fixed demo data to an empty IndexedDB database. Later edits stay on the device, and **Сбросить демо-данные** restores the original demo. No account or server is required.

## Testing

The test suite covers daily records, calculations, versioned import, demo data, key Vue components, local storage, and navigation.

```powershell
npm.cmd run lint
npm.cmd run format:check
npm.cmd test
npm.cmd run build
npm.cmd run test:e2e
```

## Run locally

Requirements: Node.js 22 and npm.

```powershell
npm.cmd ci
npm.cmd run dev
```

The synthetic data asset is generated automatically before development, production builds, and Playwright runs.

## Deployment

GitHub Actions publishes the validated demo build to GitHub Pages after changes reach `main`. The deployed app uses the `/trajectory/` base path and hash-based routes so that every screen remains available on static hosting.

## Public and production editions

This repository contains the public demo edition of Trajectory. It preserves the core product flows, domain model, analytics, local-first persistence, responsive UI, and representative application architecture.

For privacy and operational reasons, it uses synthetic data and local IndexedDB storage instead of the production infrastructure.

The production edition is developed separately and currently runs as a closed beta with invite-only registration. Authentication, cloud synchronization, backend infrastructure, private user data, internal documentation, and private development history are intentionally not included in this repository.
