# Trajectory architecture

Trajectory keeps a narrow but complete local-first product flow:

```text
Vue views
          ↓
Application features and shared UI
          ↓
Domain model and analytics
          ↓
Dexie local persistence
```

## Responsibilities

- `src/views` assemble Today, Week, and History without owning reusable UI or domain calculations.
- `src/features` owns complete product scenarios and their UI. The public demo bootstrap, reset controls, journal pagination, reviews, daily entry, and analytics live with their respective scenarios.
- `src/shared/ui` contains reusable interface primitives grouped by role. Shared modules do not depend on features, views, or stores.
- `src/features/daily-entry` owns daily form behavior and validation.
- `src/features/analytics` contains pure summaries, review cues, trend calculations, and equal-window event comparisons.
- `src/model` defines schemas, defaults, compatibility normalization, and the distinction between missing and recorded values.
- `src/stores/app.ts` coordinates application state and IndexedDB writes without knowing about Vue views.
- `src/db.ts` defines the versioned Dexie database.

Import restrictions in `eslint.config.js` keep the domain model independent from Vue, Pinia, Dexie, network clients, and pages. They also prevent shared modules from depending on features, views, or stores.

## Tests

- Narrow unit tests live in `__tests__` inside the owning feature.
- Multi-module and page scenarios live in `tests/integration`.
- Versioned data and generated artifact checks live in `tests/contracts`.
- Browser walkthroughs remain in `e2e`.

## Synthetic data boundary

```text
generated synthetic snapshot
             ↓ fetch
src/features/demo/bootstrap.ts
             ↓ validated import
Pinia store → atomic Dexie transaction
```

The generator is the source of truth for the included example content. The generated JSON is not maintained by hand and contains no production or owner data. Bootstrap runs only when all content collections are empty; normal local changes survive subsequent launches. An explicit reset uses the same validated import path.

## Public repository boundary

The public edition has no authentication, cloud synchronization, feedback API, backend, or production deployment configuration. Those systems remain part of the private production edition and are not represented by mocks here.
