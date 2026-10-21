---
title: Processes
navGroup: Features
order: 5
---
# Processes feature (`src/features/processes`)

## Purpose

Documents the processes workbench: a table card and a detail panel side by side, the quick filter tabs, the filtering and sorting rules, the URL parameters that drive them, the polling containers, the dashboard helpers and the extension points the feature exposes. For the generic extension mechanism (slots and contributions) see [../architecture/extension-framework.md](../architecture/extension-framework.md); for HOCs see [../state-and-hoc.md](../state-and-hoc.md).

## Workbench (`components/ProcessesWorkbench.tsx`)

`ProcessesWorkbench` renders the table card (tabs, refresh bar, degraded banner, running strip, filters bar, table) and `ProcessDetailPanel` side by side. It receives the props of `withOverviewData`.

### URL as the source of truth

Filters, the active tab, the sort and the selected process live in the URL search params, not in component state. `parseFilters` reads them and `toSearchParams` writes them (see "URL parameters" below). Updates use `setSearchParams(..., { replace: true })`, so they do not add history entries.

`update(patch, options)` writes the filters to the URL. It keeps the params owned by registered row filters (`rowFilter` contributions, via their `params` list) unless `clearRowFilters` is set; the "clear filters" action is the only caller that sets it. Clearing resets everything to `DEFAULT_FILTERS` except the current sort and direction.

Rows pass first through `applyFilters` (built-in filters and sort) and then through `applyRowFilters` (contributed row filters). The selected id is resolved with `resolveSelectedId`.

## URL parameters (`lib/overviewFilters.ts`)

| Param | Meaning | Default (omitted from URL) |
|---|---|---|
| `tab` | Quick filter tab: `all`, `active`, `incidents`, `errors`, `disabled` | `all` |
| `q` | Case-insensitive name search (trimmed) | empty |
| `state` | A `ProcessStatusKey` | empty |
| `area` | Exact area | empty |
| `sort` | `name`, `area`, `state`, `lastRun`, `result`, `duration` | `name` |
| `dir` | `asc` or `desc` | `asc` |
| `selected` | Id of the process shown in the detail panel; empty means the first visible row | empty |

- `parseFilters(params)` ignores unknown params and invalid values (falling back to the defaults).
- `toSearchParams(filters)` serialises the filters and omits default values, so the default view has a clean URL.
- `resolveSelectedId(visible, selected)` returns the selected process id when it is visible, otherwise the id of the first visible row.
- Row filters registered through the extension point own additional params (declared in their contribution) which are preserved across updates; see "Extension points".

### Tabs and counts

`TAB_PREDICATES` defines the tabs: `all` (everything), `active` (not disabled), `incidents` (status key `warning`), `errors` (status key `error`), `disabled` (status key `disabled`). `countByTab` and `countByStatus` produce the counters (the latter is used by the running strip). `listAreas` returns the sorted distinct areas for the area filter.

### Sorting

`SORT_VALUES` gives the comparison value per column. Processes without a last execution sort first as `-1` for `lastRun`, `result` and `duration`; `result` is ranked OK < WARNING < ERROR. Numbers are compared numerically and strings with `localeCompare`.

## Page (`pages/ProcessesPage.tsx`)

`ProcessesPage = withOverviewData(ProcessesView)`: a page with a visually hidden title that renders `ProcessesWorkbench`. The Home page embeds the same workbench (see [home.md](home.md)).

## Components

- `ProcessTabsBar` (`components/ProcessTabsBar.tsx`): quick filter tabs of the processes table, each with its count (`aria-pressed` buttons).
- `ProcessFiltersBar` (`components/ProcessFiltersBar.tsx`): search form with the name search, the area and state selects and the "clear" button; it renders the `processes.filters` slot after the core filters.
- `RunningStrip` (`components/RunningStrip.tsx`): slim strip above the table announcing processes that are running (nothing is rendered when none is running); its action switches to tab `all` with `state=running`.
- `ProcessesTable` (`components/ProcessesTable.tsx`): the table. Its table id is `PROCESSES_TABLE_ID` (`'processes'`), the id used by `tableColumn`, `rowAction`, `rowLeading` and `rowExpansion` contributions. Contributed cells in the leading and actions columns stop click and key propagation so they do not change the selection. Rows are focusable and Enter or Space selects them.
- `ProcessDetailPanel` (`components/ProcessDetailPanel.tsx`): the "Process detail" card; it shows the selected process or an empty state. The panel is remounted per process (`key={processId}`).
- `PanelRelations` (`components/PanelRelations.tsx`): `DependenciesView` shows the dependencies of the selected process with the met / unmet evaluation; `RelatedProcessesView` shows chains (previous / next) and dependents.

### Detail panel composition

- Fields: code, description, owner, state, last execution, plus the permissions row. The permissions row (`AdminPermissionsField = withAdmin(withPermissionsCount(PermissionsField))`) is for administrators only; its `user` prop is required by the admin gate that wraps the component, and it links to `/admin/permissions?process=<id>`.
- Tabs: Dependencies and Related (with counts) plus the contributed `tab` items of `processDetail.tabs`. If the selected tab no longer exists it falls back to Dependencies.
- Actions: run now (`withPermission(withManualExecution(ManualExecutionControl), 'canExecute')`, see [process-detail.md](process-detail.md)), a link to the execution history (`/processes/<id>?tab=executions`), and a "more" menu with the link to the full detail and, for admins, the activation controls (`withAdmin(withProcessActivation(ProcessActivationControls))`, see [admin.md](admin.md)).

## Containers (HOCs)

- `withOverviewData` (`containers/withOverviewData.tsx`): loads the process list, polling every 30 s (`OVERVIEW_POLL_MS`), and handles loading and error states (the generic failure uses the shared `QueryErrorState`). Provides `processes`, `lastUpdated` (timestamp in ms of the last successful load), `isRefreshing`, `isDegraded` (true when the last refresh failed and the data shown may be stale) and `refresh`.
- `withSelectedProcess` (`containers/withSelectedProcess.tsx`): loads the detail of the process given by `processId` (the one selected in the workbench) and handles loading, no permission (a 403 or 404 shows the forbidden state) and error states. It polls every 10 s (`RUNNING_POLL_MS`, see [../shared.md](../shared.md)) only while the process is running: a second subscription to the same cache entry (`skip: !running`, `pollingInterval`) adds polling only while running.
- `withPermissionsCount` (`containers/withPermissionsCount.tsx`): counts the users with access to a process; `count` is undefined while loading or when unavailable. Admin only: mount it behind `withAdmin`.
- `withLatestIncident` (`containers/withLatestIncident.tsx`): loads the first non-debug incident message of an execution (page size 1). The incident type requested matches the execution result (`error` for ERROR, `warning` otherwise), so debug entries are never returned. `message` is undefined while loading or when there is none.

## Dashboard helpers (`lib/dashboard.ts`)

- `latestExecutions(processes, limit)`: the most recent last executions across the given processes (only processes that have run, newest first).
- `recentIncidentProcesses(processes, limit)`: the most recent processes whose last execution finished with WARNING or ERROR.
- `greetingKeyFor(date)` (`morning`, `afternoon` or `night`, by the Madrid hour) and `firstNameOf(displayName)`: used by the home greeting header.
- Used by the home feature, see [home.md](home.md).

## Extension points used

- Slots: `processes.toolbar` (in the table card header, context `{ rows }` with the visible rows), `processes.filters` (end of the filters bar, context `{ filters }`), `processDetail.fields` and `processDetail.actions` (context `{ processId, process }`).
- Contributions: `rowFilter` (table `processes`), `tableColumn`, `rowAction`, `rowLeading`, `rowExpansion` (all for table `processes`), and `tab` for `processDetail.tabs`.
- `applyRowFilters(processes, rowFilters, searchParams)` returns the rows that pass every registered row filter; the URL params drive them. With no filters registered it returns the input unchanged.

## Source index

| File | Documented in section |
|---|---|
| `src/features/processes/components/PanelRelations.tsx` | Components |
| `src/features/processes/components/ProcessDetailPanel.tsx` | Components; Detail panel composition |
| `src/features/processes/components/ProcessFiltersBar.tsx` | Components |
| `src/features/processes/components/ProcessesTable.tsx` | Components; Extension points used |
| `src/features/processes/components/ProcessesWorkbench.tsx` | Workbench |
| `src/features/processes/components/ProcessTabsBar.tsx` | Components |
| `src/features/processes/components/RunningStrip.tsx` | Components |
| `src/features/processes/containers/withLatestIncident.tsx` | Containers (HOCs) |
| `src/features/processes/containers/withOverviewData.tsx` | Containers (HOCs) |
| `src/features/processes/containers/withPermissionsCount.tsx` | Containers (HOCs) |
| `src/features/processes/containers/withSelectedProcess.tsx` | Containers (HOCs) |
| `src/features/processes/lib/dashboard.ts` | Dashboard helpers |
| `src/features/processes/lib/overviewFilters.ts` | URL parameters; Extension points used |
| `src/features/processes/pages/ProcessesPage.tsx` | Page |
