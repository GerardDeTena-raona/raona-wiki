---
title: "Data & Mock Schedule"
navGroup: Out-of-Scope (OOS)
order: 2
---
# OOS data, mock schedule and helpers

## Purpose

Documents the non-visual part of the OOS module: the cross-process aggregation, the RTK Query endpoints, the mock schedule and the helper libraries in `src/oos/lib`. For the overall module see [overview.md](overview.md); for the components that consume this data see [ui.md](ui.md).

## Cross-process aggregation (`api/aggregate.ts`)

The core backend has no cross-process endpoints, so the module aggregates over the core providers. The providers already filter by the current user, so only viewable processes are ever returned.

- `loadGlobalExecutions(providers)`: first page (25 executions per process) of executions of every viewable process, newest first (`startedAt` descending). Each item is a `GlobalExecution` (`ExecutionSummary` plus `processId` and `processName`).
- `loadGlobalIncidents(providers, mode, executionLimit)`: incidents of the latest executions (up to 100 entries per execution), each as a `GlobalIncident` (`Incident` plus `executionId`, `executionResult`, `processId`, `processName`), newest first. The mode decides what is looked at:
  - `'incidents'`: only WARNING/ERROR executions, and debug entries are hidden.
  - `'logs'`: every execution, and every entry is kept (debug and unknown types included).
  `executionLimit` is how many recent executions are inspected. The result carries `hasMore`: true when older executions exist beyond the requested limit.
- Both loaders return `Aggregated<T>`: `items` plus `failed`, the number of processes or executions whose data could not be loaded. A failing process or execution is counted and skipped; it never fails the whole load.

## RTK Query endpoints (`api/oosApi.ts`)

The endpoints are injected into the shared `baseApi`:

- `getGlobalExecutions`: the aggregated executions, cut to `GLOBAL_EXECUTIONS_LIMIT` (100). Provides `Process/LIST` and an `Execution` tag per process present in the result.
- `getGlobalIncidents` (argument `{ mode, executionLimit }`): the aggregated incident entries. Provides `Process/LIST` and an `Incident` tag per execution present in the result.
- `getRunnableProcesses`: provides `Process/LIST` and `Permission/LIST`, because running, disabling or changing permissions of a process changes who can run what.

## Runnable processes (`api/runnable.ts`)

`loadRunnableProcesses` returns the processes the current user can run manually right now (id, name, area), sorted by name. The process list only contains processes the user can view. The detail carries the execute permission and the manual-activation flag, so it is read for every candidate that is neither disabled nor running (one request per process, in parallel). Only processes that are still `available`, allow manual activation and have `canExecute` are kept; a detail that fails to load is dropped.

## Mock schedule (`mock/schedule.ts`)

The backend contract has no "next run" data, so the schedule is deterministic mock data:

- It is a seeded table keyed by process id (it mirrors the frequencies and windows of the mock seed), with a stable hash fallback (a daily rule between 01:00 and 06:45, quarter-hour steps) for unknown ids.
- Rule kinds: `daily`, `weekly` (weekday), `monthly` (day of month) and `everyHours` (every N hours at a fixed minute). A `null` rule means on demand, never scheduled.
- `listScheduledRuns(processes, fromMs, toMs)`: scheduled runs with `fromMs <= at < toMs`, sorted by time (then by process name). Disabled processes have none. `at` is a UTC timestamp in ms. Day-by-day, it reads the calendar day at noon, which avoids daylight-saving edge cases.
- `listUpcomingRuns(processes, fromMs, count)`: the next `count` runs after `fromMs`; it widens the window (2, 10, then 40 days) and looks up to 40 days ahead.

## Libraries (`lib`)

### `madridTime.ts`

Calendar arithmetic in the Europe/Madrid time zone, without a date library. `getMadridParts(ms)` returns year, month (1-12), day, hour, minute and weekday (0 = Sunday ... 6 = Saturday). `madridToMs(...)` converts a Madrid wall-clock time to a UTC timestamp; day/month overflow is normalised, and two passes settle the offset around daylight-saving transitions. Also `padTwo` (zero-padded two-digit number), `toDayKey(year, month, day)` and `dayKeyOf(ms)` (`yyyy-MM-dd` key of a Madrid calendar day), `daysInMonth`, `formatShortDay` (`dd/MM`), `formatMonthTitle` and `formatDayTitle` (Spanish month and day titles).

### `csv.ts`

CSV export helpers, Excel-friendly: UTF-8 BOM, `;` separator and CRLF line breaks.

- `buildCsv(header, rows)`: joins the header and rows into the CSV text (BOM first, trailing line break).
- `escapeCsvField`: every field is always quoted and quotes are doubled. Cells starting with `=`, `+`, `-`, `@`, tab or carriage return could be executed as formulas by spreadsheets, so such text is neutralised with a leading apostrophe.
- `buildCsvFileName(prefix, nowMs)`: `prefix-YYYYMMDD-HHmm.csv` in Europe/Madrid time (for example `processes-YYYYMMDD-HHmm.csv`).
- `downloadCsv(fileName, content)`: starts the browser download of the CSV text.

### `currentUser.ts`

`isRequestedByUser(requestedBy, displayName)` tells whether an execution's `requestedBy` (a UPN such as `eva.employee@example.com`) belongs to the user with the given display name ("Eva Employee"). The contract exposes no UPN of the current user, so it is a heuristic: the first name is compared with the first part of the UPN local part (split on `.`, `_` or `-`), case-insensitively.

### `globalSearch.ts`

Client-side matching of the global search, because no backend search endpoint exists. `searchAll(query, processes, executions, incidents)` returns the groups (processes, executions, incidents) with at least one match, at most `MAX_PER_GROUP` (5) options each. Matching is a case-insensitive substring over process name, id and area; execution id; and incident message (shortened to 80 characters in the label). Each option has a `detail` (secondary text such as area, process name and date) and the route it navigates to.

### `processType.ts`

The "Type" of a process is derived from the flags of the process summary. `TYPE_PARAM` (`type`) is the URL search param that stores the selected filter. Values (`PROCESS_TYPE_KEYS`): `independent` (no chain and no dependencies), `chain` and `dependencies`. A process can be in a chain and have dependencies at the same time, so it can match both (`matchesProcessType`). `parseProcessType` treats unknown values as "no filter" (empty string).

### `routes.ts`

`processPath(processId)` and `executionPath(processId, executionId)` build the encoded detail routes used by links and navigation across the module.

### `paginate.ts`

`paginate(items, page, pageSize)` clamps the page to the available range and returns `currentPage` and the `rows` of that page.

## Source index

| File | Documented in section |
|------|-----------------------|
| `src/oos/api/aggregate.ts` | Cross-process aggregation |
| `src/oos/api/oosApi.ts` | RTK Query endpoints |
| `src/oos/api/runnable.ts` | Runnable processes |
| `src/oos/mock/schedule.ts` | Mock schedule |
| `src/oos/lib/madridTime.ts` | Libraries: madridTime |
| `src/oos/lib/csv.ts` | Libraries: csv |
| `src/oos/lib/currentUser.ts` | Libraries: currentUser |
| `src/oos/lib/globalSearch.ts` | Libraries: globalSearch |
| `src/oos/lib/processType.ts` | Libraries: processType |
| `src/oos/lib/routes.ts` | Libraries: routes |
| `src/oos/lib/paginate.ts` | Libraries: paginate |
