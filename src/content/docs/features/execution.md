---
title: Execution
navGroup: Features
order: 4
---
# Execution feature (`src/features/execution`)

## Purpose

Documents the execution detail containers and the incident helpers: how an execution and its incidents are loaded, when they are polled and how incident data is presented.

## Page (`pages/ExecutionDetailPage.tsx`)

`ExecutionDetailPage = withExecution(ExecutionDetailView)`. It renders `ExecutionSummaryPanel` (breadcrumb, previous / next execution links, result, times, activation, strategy, requester for manual executions and the evaluated dependencies), a refresh bar, an info banner while the execution is running and the incidents panel (`withIncidents(IncidentsPanel)`, polling only while running).

## Containers

- `withExecution` (`containers/withExecution.tsx`): reads `:id` and `:executionId` from the route and loads the execution. An execution that belongs to a different process than `:id` is shown as not found, as are 404 failures; a 403 shows the forbidden state and any other failure the shared `QueryErrorState`. It polls every 10 s (`RUNNING_POLL_MS`) only while the execution is running: a second subscription to the same cache entry (`skip: !running`, `pollingInterval: RUNNING_POLL_MS`) adds polling only while running. `lastUpdated` is the timestamp (ms) of the last successful load.
- `withIncidents` (`containers/withIncidents.tsx`): loads the incident summary and the list of an execution (page size 100). The `poll` prop must be true only while the execution is running; it then polls every 10 s (`RUNNING_POLL_MS`). State is `loading`, `ready` (summary, items, total) or `unavailable`: any failure of the summary or list degrades to `unavailable`, with `retryIncidents` refetching both queries.

## Incident helpers (`lib/incidents.ts`)

- `MSG_DATA_PREVIEW_LIMIT` (4096): the list view shows at most this many characters of `msgData` (`truncateText` produces the truncated text and a flag).
- `formatMsgData(raw)`: pretty-prints `msgData` when it is valid JSON object or array; otherwise returns it unchanged (plain text).
- `visibleIncidents(items, type, showDebug)`: newest first. When a type filter is chosen it returns only that type; otherwise it hides debug entries unless `showDebug` is set.
- `INCIDENT_TYPES` and `getIncidentTypeLabel` provide the type catalogue and its localised labels.

## Components

- `IncidentsPanel`: per-type count pills, a type filter, a "show debug" checkbox and the incidents table. When the list is shorter than the total, a note tells how many are shown. The `unavailable` state renders a degraded `PageState` with a retry.
- `IncidentRow`: one incident. `msgData` is shown in a disclosure as a code block (pretty-printed, truncated at `MSG_DATA_PREVIEW_LIMIT` with a "view full" action) with a copy button.
- `ExecutionSummaryPanel`: the summary card of the execution page.

## Source index

| File | Documented in section |
|---|---|
| `src/features/execution/components/ExecutionSummaryPanel.tsx` | Components |
| `src/features/execution/components/IncidentRow.tsx` | Components |
| `src/features/execution/components/IncidentsPanel.tsx` | Components |
| `src/features/execution/containers/withExecution.tsx` | Containers |
| `src/features/execution/containers/withIncidents.tsx` | Containers |
| `src/features/execution/lib/incidents.ts` | Incident helpers |
| `src/features/execution/pages/ExecutionDetailPage.tsx` | Page |
