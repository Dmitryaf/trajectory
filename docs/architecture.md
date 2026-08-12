# Trajectory architecture

Trajectory keeps a narrow but complete local-first product flow:

```text
Vue views and components
          ↓
Application features
          ↓
Domain model and analytics
          ↓
Dexie local persistence
```

## Responsibilities

- `src/views` and `src/components` render Today, Week, and Trends and coordinate user interaction.
- `src/features/daily-entry` owns daily form behavior and validation.
- `src/features/analytics` contains pure summaries, review cues, trend calculations, and equal-window event comparisons.
- `src/model` defines schemas, defaults, compatibility normalization, and the distinction between missing and recorded values.
- `src/stores/app.ts` coordinates application state and IndexedDB writes without knowing about Vue views.
- `src/db.ts` defines the versioned Dexie database.

Import restrictions in `eslint.config.js` keep the domain model independent from Vue, Pinia, Dexie, network clients, and page components.

## Synthetic data boundary

```text
generated synthetic snapshot
             ↓ fetch
src/demo/bootstrap.ts
             ↓ validated import
Pinia store → atomic Dexie transaction
```

The generator is the source of truth for the included example content. The generated JSON is not maintained by hand and contains no production or owner data. Bootstrap runs only when all content collections are empty; normal local changes survive subsequent launches. An explicit reset uses the same validated import path.

## Public repository boundary

The public edition has no authentication, cloud synchronization, feedback API, backend, or production deployment configuration. Those systems remain part of the private production edition and are not represented by mocks here.
