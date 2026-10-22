---
title: User Interface
navGroup: Out-of-Scope (OOS)
order: 3
---
# OOS user interface

## Purpose

Documents the components, containers, contributions and styles of the OOS module (`src/oos`). Registration and removal are in [overview.md](overview.md); the data they use is in [data-and-mock.md](data-and-mock.md). Core styles and tokens are in [../styles.md](../styles.md).

## Shared components (`components`)

- `PageHeader`: page title (h1), optional description and optional trailing actions.
- `IncidentTypeBadge`: pill of an incident/log entry type (colour, icon and text label, never colour alone).
- `QueryErrorState`: error `PageState` built from an RTK Query error (message and correlation id) with a retry callback; used by the containers and the run picker.
- `PopupMenu`: menu button following the WAI-ARIA menu button pattern: `aria-haspopup` / `aria-expanded` trigger, arrow keys, Home/End, Escape and click outside. The menu uses fixed positioning so it is not clipped by scrolling table wrappers; for the same reason it closes when the page layout moves under it. Focus is moved into the menu only after it has rendered (`requestAnimationFrame`). Props: `label` (accessible name of the trigger button and of the menu), `trigger` (visible content, usually an icon), `items` (`PopupMenuItem`: `id`, `label`, `onSelect`), `placeholder` (shown instead of the items when there are none: loading, empty), `onOpen` (called when the menu opens) and `triggerClassName`.
- `DownloadIcon`: decorative download glyph (the button text carries the name).

## Hooks and i18n

- `useDismiss` (`hooks/useDismiss.ts`): while `active`, calls `onDismiss` on Escape or on a pointer press outside `containerRef`.
- `useOosT` (`i18n/useOosT.ts`): translator bound to the `oos` namespace. The namespace is registered at runtime, so it is not part of the typed core resources.

## Containers (`containers`)

Container HOCs that load the cross-process data and handle loading and error states:

- `withGlobalExecutions`: loads the cross-process execution list. Passes `failed`: the number of processes whose executions could not be loaded.
- `withGlobalIncidents(Component, mode)`: loads the incident entries of the latest executions across processes. `mode` `'incidents'` keeps WARNING/ERROR executions without debug entries; `'logs'` keeps everything. `loadMore` inspects older executions too (the first load inspects 20 executions and each step adds 20). `failed` means the entries come from only some of the processes/executions because others failed to load.

## Home contributions (`home`)

All are hidden in the document scope.

- `KpiProgress` (slot `home.kpiCardExtras`): progress bar plus the percentage of the total; it is not shown on the total card.
- `UpcomingCard` (slot `home.sideCards`): next scheduled runs from the OOS mock schedule.
- `DistributionCard` (slot `home.footerCards`): status donut and processes-by-area bars. `groupCounts` uses the same classification as the Home KPI cards; running, not executed and no-runs processes fold into "other".
- `DonutChart`: hand-written SVG donut. The circle has radius 15.9155, whose circumference is 100, so stroke lengths are percentages. Props: each segment has a `tone` (CSS modifier of the segment colour); `label` is the accessible description of the whole chart (the legend carries the per-segment data).

## Pages (`pages`)

- `CalendarPage`: month calendar of scheduled runs, with a Monday-first grid (leading blanks, the days, trailing blanks).
- `ExecutionsPage` (wrapped by `withGlobalExecutions`): client-side filters (result, activation, process name) over the aggregated executions, 25 rows per page.
- `IncidentsPage` (`withGlobalIncidents` in `incidents` mode): filters by type (no debug) and text, 25 rows per page, messages shortened to 120 characters.
- `LogsPage` (`withGlobalIncidents` in `logs` mode): every entry, filters by type, process and text, a copy button per message and a "load more" button while older executions remain.
- `SettingsPage`: read-only configuration overview; nothing is persisted.
- `NavIcons`: sidebar icons of the pages.
- `register.tsx`: nav items and lazy routes (see [overview.md](overview.md)).

## Top bar (`topbar`)

- `GlobalSearch`: ARIA combobox with a grouped listbox. Processes are searched in the cached process list; executions and incidents come from the cross-process aggregates, which are loaded the first time the field receives focus. It calls the incidents aggregate with the same arguments as the incidents page (`mode: 'incidents'`, `executionLimit: 20`), so both share the cached result. Option mouse-down is prevented to keep the focus in the input, because the click navigates on its own.
- `NotificationBell`: the badge counts the visible processes whose last result is ERROR; the popover lists the latest WARNING / ERROR executions (loaded the first time it opens).
- `BellIcon`: decorative bell glyph (the button carries the accessible name).

## Processes table (`table`)

All contributions target the core `processes` table (`PROCESSES_TABLE` in `tableId.ts`).

- `NextRunCell`: "Next run" cell, from the mock schedule, or a dash when there is none.
- `RowActions`: trailing cell of a process row: run button and "..." menu (open, history, copy id). `MoreIcon` is the decorative horizontal ellipsis glyph (the button carries the accessible name).
- `ExpandToggle`: leading cell, a chevron that expands or collapses the related-processes row.
- `RelatedProcesses`: expansion row content: chain neighbours and dependents (loaded only while expanded).
- `ExportButton`: toolbar button that downloads the visible rows as CSV. `ExportSlot` is the adapter for the `processes.toolbar` slot, whose context carries the visible rows.
- `TypeFilter`: "Type" filter. Its value lives in the `type` URL param; the matching row filter is registered in `table/register.tsx`. The core "Clear" action removes the param.

## Process detail (`detail`)

- `SubprocessesTab`: the "Subprocesos" tab: chain members (current one highlighted) and dependents.
- `TypeField`: "Type" row: independent, in chain (position) and/or with dependencies.
- `EditProcess`: "Edit" button. This console does not modify processes: the dialog shows their fields read-only with a note, and nothing is persisted.

## Manual run (`run`)

- `RunProcessButton`: split button of the Home header. The main button opens the process picker; the chevron opens a menu with the processes the user ran manually most recently (or, when there are none, the first runnable ones) for a one-click confirmation dialog.
- `RunProcessPicker`: searchable list of the processes the current user can run now.
- `RunProcessDialog`: manual execution of one process. It checks that it can be run now (permission, state, manual activation) and then shows the core confirmation dialog; when it cannot be run it explains why. Once the process is cleared to run (`cleared` state) the check is not repeated: the request itself changes its state (running) and must not replace the confirmation dialog with a "blocked" message.

## Styles (`src/oos/styles`)

`oos.scss` is the entry point (it uses the partials below); tokens come from `src/styles/tailwind.css`. Class names use the `oos-` prefix.

- `_controls.scss`: shared controls: popup menu (`.oos-menu`), split button ("Run process", `.oos-split`) and process picker dialog (`.oos-picker`).
- `_home.scss`: home extras: KPI progress (`.oos-kpi-progress`), distribution card (`.oos-distribution`) and upcoming executions (`.oos-upcoming`). The map `$group-tones` maps each chart group to a status token.
- `_pages.scss`: OOS pages: page header (`.oos-page-header`), calendar (`.oos-calendar`), logs (`.oos-log-scroll`) and settings (`.oos-settings`).
- `_table.scss`: OOS additions to the processes table and the detail panel (for example `.oos-row-actions`).
- `_topbar.scss`: global search (`.oos-search`) and notification bell; they live on the dark topbar.

## Source index

| File | Documented in section |
|------|-----------------------|
| `src/oos/components/DownloadIcon.tsx` | Shared components |
| `src/oos/components/IncidentTypeBadge.tsx` | Shared components |
| `src/oos/components/PageHeader.tsx` | Shared components |
| `src/oos/components/PopupMenu.tsx` | Shared components |
| `src/oos/components/QueryErrorState.tsx` | Shared components |
| `src/oos/hooks/useDismiss.ts` | Hooks and i18n |
| `src/oos/i18n/useOosT.ts` | Hooks and i18n |
| `src/oos/containers/withGlobalExecutions.tsx` | Containers |
| `src/oos/containers/withGlobalIncidents.tsx` | Containers |
| `src/oos/home/DistributionCard.tsx` | Home contributions |
| `src/oos/home/DonutChart.tsx` | Home contributions |
| `src/oos/home/KpiProgress.tsx` | Home contributions |
| `src/oos/home/UpcomingCard.tsx` | Home contributions |
| `src/oos/pages/CalendarPage.tsx` | Pages |
| `src/oos/pages/ExecutionsPage.tsx` | Pages |
| `src/oos/pages/IncidentsPage.tsx` | Pages |
| `src/oos/pages/LogsPage.tsx` | Pages |
| `src/oos/pages/NavIcons.tsx` | Pages |
| `src/oos/pages/SettingsPage.tsx` | Pages |
| `src/oos/topbar/BellIcon.tsx` | Top bar |
| `src/oos/topbar/GlobalSearch.tsx` | Top bar |
| `src/oos/topbar/NotificationBell.tsx` | Top bar |
| `src/oos/table/ExpandToggle.tsx` | Processes table |
| `src/oos/table/ExportButton.tsx` | Processes table |
| `src/oos/table/MoreIcon.tsx` | Processes table |
| `src/oos/table/NextRunCell.tsx` | Processes table |
| `src/oos/table/RelatedProcesses.tsx` | Processes table |
| `src/oos/table/RowActions.tsx` | Processes table |
| `src/oos/table/tableId.ts` | Processes table |
| `src/oos/table/TypeFilter.tsx` | Processes table |
| `src/oos/detail/EditProcess.tsx` | Process detail |
| `src/oos/detail/SubprocessesTab.tsx` | Process detail |
| `src/oos/detail/TypeField.tsx` | Process detail |
| `src/oos/run/RunProcessButton.tsx` | Manual run |
| `src/oos/run/RunProcessDialog.tsx` | Manual run |
| `src/oos/run/RunProcessPicker.tsx` | Manual run |
| `src/oos/styles/oos.scss` | Styles |
| `src/oos/styles/_controls.scss` | Styles |
| `src/oos/styles/_home.scss` | Styles |
| `src/oos/styles/_pages.scss` | Styles |
| `src/oos/styles/_table.scss` | Styles |
| `src/oos/styles/_topbar.scss` | Styles |
