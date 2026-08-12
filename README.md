# Trajectory

Trajectory is a local-first product for capturing meaningful daily observations, reflecting on completed periods, and using personal analytics to make better-informed next decisions. It is intentionally not a task manager, habit tracker, or generic productivity dashboard.

The product is actively developed in a private production repository. This public repository is a curated portfolio slice with real product UI, domain logic, analytics, local persistence, and test automation, while private infrastructure and user data remain excluded.

![Trajectory weekly reflection](docs/screenshots/trajectory-week-review.png)

**Vue 3 · TypeScript · Pinia · Dexie · ECharts · Vite PWA**

## Why Trajectory

Daily notes are easy to collect and hard to interpret. Trajectory connects observations to periodic reflection without presenting correlations as proven causes:

```text
daily observations
        ↓
weekly / monthly reflection
        ↓
patterns and comparisons
        ↓
better-informed next decisions
```

Missing observations remain missing, unusual days can be separated from ordinary patterns, and comparisons expose their sample sizes and incomplete periods.

## Product flow

- **Today:** capture sleep, energy, context, actions, life areas, and one factual note without requiring every field.
- **Weekly reflection:** combine coverage, noteworthy observations, completed outcomes, special days, and one next decision.
- **Trends:** inspect longer-term change, monthly metrics, and equal-window comparisons around important events.

The private product also supports a broader reflection workflow; this showcase deliberately focuses on the three representative screens above.

## Engineering highlights

- **Local-first state:** Pinia coordinates application state while Dexie persists real user edits in IndexedDB across reloads.
- **Explicit architecture boundaries:** domain normalization, application orchestration, Vue presentation, analytics, and persistence have separate responsibilities enforced by import rules.
- **Safe data evolution:** versioned snapshots are fully validated and normalized before replacement is applied in one Dexie transaction.
- **Analytics semantics:** calculations preserve missing values, sample counts, incomplete periods, and special-day exclusions instead of silently manufacturing complete datasets.
- **Calculation/presentation split:** pure analytics modules produce summaries and comparisons; Vue and ECharts coordinate and visualize the result separately.
- **Responsive PWA behavior:** the shell includes route-level code splitting, service-worker updates, offline-capable local data, and stale-chunk recovery.
- **Reproducible evidence:** the running showcase, unit tests, browser tests, and screenshots use the same deterministic synthetic-data generator.

## Product walkthrough

### Today — preserve useful context with low daily friction

The mobile-first entry keeps the current week visible while allowing the user to record only the observations that matter that day.

<p align="center">
  <img src="docs/screenshots/trajectory-today-mobile.png" alt="Trajectory daily entry on mobile" width="390" />
</p>

### Week — turn observations into a reflection

The hero screenshot shows a completed week with coverage, cautious review cues, recorded outcomes, important context, and a next-decision workflow.

### Trends — compare change without overstating causality

Longer-term views expose observation counts and interpretation boundaries alongside real calculated trends.

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

See [the showcase architecture](docs/architecture.md) for responsibilities and the public/private boundary.

### Representative code

For a focused source review, start with:

- [domain model and compatibility normalization](src/model/normalization.ts);
- [personal analytics](src/features/analytics);
- [Dexie schema](src/db.ts) and [local application store](src/stores/app.ts);
- [daily-entry application flow](src/features/daily-entry);
- [demo bootstrap](src/demo/bootstrap.ts) and [synthetic-data generator](scripts/generate-demo-data.mjs).

## Demo

On first launch, an empty IndexedDB database receives a validated synthetic snapshot. Later edits remain local, and **Сбросить демо-данные** restores the reproducible baseline. No credentials, backend, or account are required.

## Testing and quality

The focused suite covers domain and daily-entry behavior, analytics semantics, versioned import, demo generation/bootstrap, a representative Vue surface, local persistence, and navigation to analytics.

```powershell
npm.cmd run lint
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

The synthetic asset is generated automatically before development, production builds, and Playwright runs.

## Production vs showcase

This repository is intended for source review and portfolio demonstration. It preserves representative product, domain, analytics, local-first, and PWA code while intentionally excluding production authentication, cloud synchronization, backend infrastructure, internal documentation, user data, and private development history.
