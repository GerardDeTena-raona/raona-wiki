---
title: Overview
navGroup: Out-of-Scope (OOS)
order: 1
---
# Out-of-scope (OOS) module overview (`src/oos`)

## Purpose

Explains what the OOS module is, how it plugs into the core, and how to remove it. Details are in [data-and-mock.md](data-and-mock.md) (API, mock schedule, helpers) and [ui.md](ui.md) (components, pages and styles). The extension mechanism itself is described in [../architecture/extension-framework.md](../architecture/extension-framework.md).

## What OOS is

Everything under `src/oos` is optional functionality that goes beyond the technical document. It is a single self-contained module built only from contributions to the core extension points (slots, tabs, nav items, routes, table columns, row actions, row filters, row leading cells and row expansions).

## Single entry point and self-registration

- `src/oos/register.ts` is the only entry point. It imports the stylesheet (`./styles/oos.scss`), the six contribution files (`home`, `pages`, `run`, `topbar`, `table`, `detail` `register` modules), registers the `oos` translation namespace in Spanish (`registerTranslations('oos', 'es', es)`) and registers the scope toggle.
- The core discovers that file without referencing it statically: `src/app/extensions/autoload.ts` runs `import.meta.glob('../../oos/register.ts', { eager: true })`. When the folder does not exist the glob matches nothing and the build still passes.
- Because of that glob, nothing outside `src/oos` imports from it.

## Removing the module

The whole directory can be deleted. The core builds and runs unchanged without it, because the only link is the glob above.

## Dependency rule

OOS code may import from the core, never the other way round. Never add an import of `src/oos` to core code.

## Scope toggle and visibility

- Every contribution except the scope toggle is flagged `oos: true`, so it is hidden when the scope mode is `document`.
- The scope toggle (`oos.scopeToggle`, slot `topbar.end`, order 0) is `alwaysVisible: true` and flagged `oos: true`. `ScopeToggle` switches between the full console (`full`) and the document-scope view where OOS is hidden (`document`). It is a `role="switch"` button, `aria-checked` when the mode is `document`.
- Routes of OOS pages are wrapped by the core `ScopeGate` automatically, so they are also unreachable in document scope.

## i18n

The OOS strings live in the `oos` namespace (`src/oos/i18n/es.json`). The namespace is registered at runtime, so it is not part of the typed core resources; components use `useOosT` (a translator bound to the `oos` namespace), and contributions reference keys as `oos:...`.

## OOS elements and where they live

| Element | Contribution (slot or extension) | Location |
|---------|----------------------------------|----------|
| Scope toggle | `topbar.end`, order 0, always visible | `src/oos/ScopeToggle.tsx` |
| Global search | `topbar.center` | `src/oos/topbar/GlobalSearch.tsx` |
| Notification bell | `topbar.end`, order -10 (before the scope toggle) | `src/oos/topbar/NotificationBell.tsx` |
| KPI progress | `home.kpiCardExtras` | `src/oos/home/KpiProgress.tsx` |
| Upcoming executions card | `home.sideCards` | `src/oos/home/UpcomingCard.tsx` |
| Distribution card (donut and bars) | `home.footerCards` | `src/oos/home/DistributionCard.tsx` |
| "Run process" split button | `home.toolbar` | `src/oos/run/` |
| Calendar, Logs, Executions, Incidents pages | nav group `main` (orders 30, 40, 50, 60) plus routes | `src/oos/pages/` |
| Settings page | nav group `admin` (order 40) plus route | `src/oos/pages/SettingsPage.tsx` |
| Next run column | table column on `processes` | `src/oos/table/NextRunCell.tsx` |
| Row actions (run, "..." menu) | row action | `src/oos/table/RowActions.tsx` |
| Expand toggle and related processes | row leading cell and row expansion | `src/oos/table/ExpandToggle.tsx`, `RelatedProcesses.tsx` |
| CSV export | `processes.toolbar` | `src/oos/table/ExportButton.tsx` |
| Type filter | `processes.filters` slot plus row filter on the `type` URL param | `src/oos/table/TypeFilter.tsx`, `src/oos/lib/processType.ts` |
| Subprocesses tab | `processDetail.tabs` | `src/oos/detail/SubprocessesTab.tsx` |
| Type field | `processDetail.fields` | `src/oos/detail/TypeField.tsx` |
| Edit button (read-only dialog) | `processDetail.actions` | `src/oos/detail/EditProcess.tsx` |

Per-folder registration files:

- `src/oos/home/register.ts`: home dashboard contributions (all hidden in the document scope).
- `src/oos/pages/register.tsx`: sidebar items and routes of the OOS pages. Each page is lazy loaded (`lazyPage`): every page becomes its own chunk, loaded on first visit, with a loading `PageState` as fallback. Routes are wrapped by `ScopeGate` automatically.
- `src/oos/run/register.ts`: Home header, global "Run process" split button.
- `src/oos/topbar/register.ts`: global search (center) and notification bell (before the scope toggle).
- `src/oos/table/register.tsx`: contributions to the processes table: Next run column, row actions, expansion, export and Type filter. The table id `processes` is kept in `src/oos/table/tableId.ts` (`PROCESSES_TABLE`), because table contributions are keyed by the id of the core table.
- `src/oos/detail/register.ts`: contributions to the process detail panel: Subprocesses tab, Type field, Edit button.

## Source index

| File | Documented in section |
|------|-----------------------|
| `src/oos/register.ts` | Single entry point; Removing the module; Dependency rule; Scope toggle and visibility |
| `src/oos/ScopeToggle.tsx` | Scope toggle and visibility |
| `src/oos/home/register.ts` | OOS elements (per-folder registration files) |
| `src/oos/pages/register.tsx` | OOS elements (per-folder registration files) |
| `src/oos/run/register.ts` | OOS elements (per-folder registration files) |
| `src/oos/topbar/register.ts` | OOS elements (per-folder registration files) |
| `src/oos/table/register.tsx` | OOS elements (per-folder registration files) |
| `src/oos/table/tableId.ts` | OOS elements (per-folder registration files) |
| `src/oos/detail/register.ts` | OOS elements (per-folder registration files) |
| `src/oos/i18n/useOosT.ts` | i18n |
