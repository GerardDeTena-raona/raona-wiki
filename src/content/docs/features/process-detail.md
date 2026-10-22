---
title: Process Detail
navGroup: Features
order: 3
---
# Process detail feature (`src/features/process-detail`)

## Purpose

Documents the process detail page building blocks: header, permissions section, containers that load executions, skipped attempts, relations and permissions, and the manual execution flow with its confirmation dialog. The same containers are reused by the processes workbench panel ([processes.md](processes.md)).

## Page (`pages/ProcessDetailPage.tsx`)

`ProcessDetailPage = withProcess(withUser(ProcessDetailView))`. It renders the header with the run control and, for admins, the activation controls; a refresh bar (fed by the `lastUpdated`, `isRefreshing` and `refreshProcess` props of `withProcess`) and four tabs. The active tab lives in the `tab` URL param (`executions`, `skipped`, `relations` or `information`; anything else selects `executions`) and changes replace the history entry.

- `ExecutionsTab`: filters (result, activation and a date range that defaults to the last 30 days, from `ExecutionsFiltersForm`) and the executions table, one server-side page of `PAGE_SIZE` rows at a time. Changing a filter returns to page 1.
- `SkippedTab`: the skipped attempts table with its pagination.
- `RelationsTab`: chains, dependencies and dependents (`RelationsView` behind `withProcessRelations`).
- `InformationTab`: `ProcessInformation` (identity, systems, frequency, window, estimated duration, manual activation and the permissions of the current user) plus, for admins, the permissions section.

## Manual execution flow

### Availability (`lib/manualExecution.ts`)

`getRunBlockedReason(process)` returns why the manual execution is not available, or `null` when it can be requested. Checks, in order: the user lacks `canExecute`, the process is disabled, the process is running, manual activation is not allowed. Messages come from the `processDetail:runBlocked.*` i18n keys.

### Container (`containers/withManualExecution.tsx`)

`withManualExecution` drives the whole flow: the request, the outcome states and the relations shown to confirm. `outcome` is one of the phases `idle`, `requesting`, `accepted` (with the new `executionId`), `rejected` (a 409 or 403 business rejection, with the unmet dependencies and correlation id) or `error` (a technical failure), derived with `describeRejection`. `relations` is undefined while loading or when the relations are not available, and `relationsFailed` is true when loading them failed. `reset()` returns to `idle`. `run()` sends a new manual execution request with a freshly generated idempotency key (`crypto.randomUUID()`): every confirmed click is a new execution, hence a new idempotency key.

### Dialog (`components/ManualExecutionDialog.tsx`)

- `ManualExecutionDialogView`: confirmation dialog of a manual execution (mount it to open it). Until the request is accepted it shows Cancel / Confirm; once accepted it shows the result and a link to the new execution with a single Close button. `onClose` is called on Cancel, Close and Esc, and the parent must unmount the dialog in response (see `ModalDialog` in [../shared.md](../shared.md)).
- `ManualExecutionDialog`: controlled version. It loads the relations and sends the request (a new idempotency key per confirmation). Nothing is loaded while it is closed, and every opening starts from a clean state.

### Control (`components/ManualExecutionControl.tsx`)

The "run now" button. It is disabled with the reason of `getRunBlockedReason` (linked through `aria-describedby`); opening it resets the outcome and shows `ManualExecutionDialogView`. After the request is accepted the dialog is replaced by the outcome message and a link to the new execution.

## Containers

All containers show the loading `PageState` and the shared `QueryErrorState` (with retry) for a failed load.

- `withProcessExecutions`: loads one server-side page of executions of a process (`processId` and `query`).
- `withSkippedAttempts`: loads one server-side page of skipped (not executed) attempts of a process (`processId`, `page`, `pageSize`).
- `withProcessRelations`: loads the relations (chains, dependencies, dependents) of the process given by `processId`. It also exposes `isViewable(processId)`: whether the current user can open the detail of a given process, computed from the list of visible processes. While that list is not available the link is offered anyway; the detail answers 404 if the user is not allowed.
- `withProcessPermissions`: loads the users with permission on a process. Admin only: mount it behind `withAdmin`.

## Components

- `ProcessHeader`: the optional `actions` prop holds the action controls (run, activation) rendered at the right of the title.
- `PermissionsSection`: the `user` prop is required by the admin gate that wraps the section.

- `ExecutionsTable`: executions of the process with a link to each execution, plus pagination; the requester is shown only for manual executions.
- `SkippedAttemptsTable`: one row per unmet dependency of a skipped attempt (or a single row without detail), plus pagination.
- `RelationsView`: chains with their members, dependencies and dependents.
- `ProcessInformation`: the information tab content.
- `ExecutionResultBadge`: result badge of an execution status, or a dash when there is no result; shared by the relations and skipped attempts tables.

## Helpers (`lib`)

- `getExecutionPath(processId, executionId)`: route of the execution detail, used by every link to an execution.
- `PAGE_SIZE` (25): page size of the executions and skipped attempts tabs.

## Source index

| File | Documented in section |
|---|---|
| `src/features/process-detail/components/ExecutionsFiltersForm.tsx` | Page |
| `src/features/process-detail/components/ExecutionsTable.tsx` | Components |
| `src/features/process-detail/components/ManualExecutionControl.tsx` | Manual execution flow (Control) |
| `src/features/process-detail/components/ManualExecutionDialog.tsx` | Manual execution flow (Dialog) |
| `src/features/process-detail/components/PermissionsSection.tsx` | Components |
| `src/features/process-detail/components/ProcessHeader.tsx` | Components |
| `src/features/process-detail/components/ProcessInformation.tsx` | Components |
| `src/features/process-detail/components/RelationsView.tsx` | Components |
| `src/features/process-detail/components/SkippedAttemptsTable.tsx` | Components |
| `src/features/process-detail/pages/ExecutionsTab.tsx` | Page |
| `src/features/process-detail/pages/InformationTab.tsx` | Page |
| `src/features/process-detail/pages/ProcessDetailPage.tsx` | Page |
| `src/features/process-detail/pages/RelationsTab.tsx` | Page |
| `src/features/process-detail/pages/SkippedTab.tsx` | Page |
| `src/features/process-detail/containers/withManualExecution.tsx` | Manual execution flow (Container) |
| `src/features/process-detail/containers/withProcessExecutions.tsx` | Containers |
| `src/features/process-detail/containers/withProcessPermissions.tsx` | Containers |
| `src/features/process-detail/containers/withProcessRelations.tsx` | Containers |
| `src/features/process-detail/containers/withSkippedAttempts.tsx` | Containers |
| `src/features/process-detail/components/ExecutionResultBadge.tsx` | Components |
| `src/features/process-detail/lib/executionPath.ts` | Helpers |
| `src/features/process-detail/lib/manualExecution.ts` | Manual execution flow (Availability) |
| `src/features/process-detail/lib/pagination.ts` | Helpers |
