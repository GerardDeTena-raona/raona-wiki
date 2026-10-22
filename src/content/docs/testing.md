---
title: Testing
navGroup: Styling & Testing
order: 2
---
# Testing

Unit tests run on Vitest in the `node` environment. There is no jsdom and no Testing Library: only pure logic and the in-memory mock backend are covered.

## How to run

| Command | Purpose |
|---|---|
| `pnpm test` | Single run (`vitest run`), used before every commit |
| `pnpm test:watch` | Watch mode while developing |
| `pnpm exec vitest run <path>` | Run one file or folder, for example `src/shared/lib` |

The configuration is the `test` block of `vite.config.ts`: `environment: 'node'`, `include: ['src/**/*.test.ts']`, `exclude: ['src/oos/**', 'node_modules/**']`, `passWithNoTests: true`. Test files are never imported by the application, so they are not part of the production bundle, but `pnpm typecheck` (`tsc -b`, which includes `src`) and `pnpm lint` (`eslint .`) do check them.

## Conventions

- One `<module>.test.ts` next to the module it covers.
- Explicit `import { describe, it, expect } from 'vitest'`; no globals.
- English test names that describe observable behaviour, not implementation.
- No code comments, same as the rest of the source.
- Tests assert on the real Spanish i18n resources, so a wording change in a locale file makes the affected tests fail on purpose.
- Determinism:
  - Dates: build them explicitly (`new Date('2025-01-15T12:00:00Z')`) or use `vi.useFakeTimers()` with `vi.setSystemTime()`. Madrid time (`Europe/Madrid`, winter and summer) is asserted through explicit instants.
  - Local-time helpers (`toDateInputValue`, `dayStartIso`, `dayEndIso`) are compared against dates built with the local `Date` constructor, so the result does not depend on the machine time zone.
  - Randomness: `vi.spyOn(Math, 'random')`.
  - Timers: fake timers, never real waiting.

## Module state and isolation

Several modules keep state at module level (`mockDb`, `mockSession`, `app/extensions/registry`) or compute it when imported (`config/env`, `auth/entra/claims`). Tests isolate that state without changing production code:

1. `vi.resetModules()` clears the module registry.
2. The module under test is loaded with a dynamic `import()` after the environment is prepared (system time, `vi.stubEnv`, `vi.stubGlobal('window', ...)`).
3. Every test therefore starts from a fresh seed, an empty registry or a new environment.

`mockDb` specifics (`src/backend/providers/mock/mockDb.test.ts`):

- `mockSession`, `mockConfig` and `mockDb` are imported from the same fresh registry, so `setMockCurrentUser` changes the user seen by `mockDb`.
- The system time is fixed before the import because the seed is built from `Date.now()`.
- Manual executions finish through `setTimeout(mockConfig.executionDurationMs)`: tests advance fake timers and spy `Math.random` to force `OK` (below 0.7), `WARNING` (from 0.7 below 0.9) and `ERROR` (from 0.9).
- Errors are asserted by shape (`name`, `status`, `code`) instead of `instanceof`, because the `BackendError` class of a reset registry is not the one imported statically by the test.

`mockSession` reads `window.localStorage` inside `try/catch`. In the node environment `window` does not exist, which exercises the fallback path; the storage path is covered with `vi.stubGlobal('window', { localStorage })`.

## What is covered

| Area | Modules |
|---|---|
| Shared helpers | `status`, `format`, `errors`, `actionResult`, `polling` in `src/shared/lib` |
| Processes | `overviewFilters`, `dashboard` |
| Process detail | `manualExecution`, `executionPath`, `pagination` |
| Execution | `incidents` |
| Administration | `auditFilters`, `adminProcessFilters`, `permissionRules` |
| Backend | `BackendError`, `mockDb` (through the exported `db*` functions), `mockSession` |
| Application | `app/extensions/registry`, `auth/entra/claims`, `config/env` |

## What is intentionally not covered

- React components, higher-order components and hooks that need rendering (`use*` files, `with*` HOCs): they need jsdom and Testing Library.
- `src/oos`: out of scope by definition and excluded from the test run.
- The HTTP provider, `createMockProviders`, `mockSeed` directly (it is exercised through `mockDb`) and `mockConfig` (constants).
- End-to-end flows and coverage thresholds.

## Source index

| File | Section |
|---|---|
| `vite.config.ts` | How to run |
| `package.json` | How to run (`test`, `test:watch`) |
| `src/**/*.test.ts` | Conventions, What is covered |
| `src/backend/providers/mock/mockDb.test.ts` | Module state and isolation |
