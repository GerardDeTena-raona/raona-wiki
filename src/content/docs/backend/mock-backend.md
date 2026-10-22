---
title: Mock Backend
navGroup: Backend
order: 3
---
# Mock backend (`src/backend/providers/mock`)

## Purpose

Documents the in-memory mock backend used for development (`backendMode` `mock`): seed data, the rules it mirrors from the BFF, its tuning knobs, the development session and its concurrency/idempotency behaviour. Contracts are in [contracts](contracts.md); the provider layer in [providers](providers.md).

## Structure

- `createMockProviders.ts`: implements `Providers` by wrapping every `mockDb` function in `call`.
- `mockDb.ts`: the store (built once with `buildSeed(Date.now())`) and all rules.
- `mockSeed.ts`: the seed data.
- `mockSession.ts`: the dev user list and selection.
- `mockConfig.ts`: tuning knobs.

## Latency and failure injection (`call`)

Every provider call first waits and then may fail, before running the operation against the store:

- `mockConfig.latencyMs`: fixed latency in ms; `null` means a random 150-400 ms.
- `mockConfig.failureRate`: probability (0..1) that any provider call fails with a `BackendError` 500 (`mock_failure`, "Simulated mock failure"). Default 0.
- `mockConfig.executionDurationMs`: time a manual execution stays `RUNNING` before completing (default 15 000 ms).

The knobs are dev-only and intentionally not wired to any UI.

## Session and dev users (`mockSession.ts`)

| objectId | UPN | Display name | Admin |
|---|---|---|---|
| `u-ana-0001` | `ana.admin@example.com` | Ana Admin | yes |
| `u-eva-0002` | `eva.employee@example.com` | Eva Employee | no |
| `u-vic-0003` | `vic.viewer@example.com` | Vic Viewer | no |
| `u-nora-0004` | `nora.noaccess@example.com` | Nora NoAccess | no |

- The current user is shared by the mock auth (writer, via `setMockCurrentUser`) and the mock data layer (reader, via `getMockCurrentUser`). There is no React in this module.
- The selection is persisted in `localStorage` under `mock.currentUserId`; the default is the first user (Ana). If storage is unavailable the selection only lasts for the current page load. An unknown id leaves the current user unchanged.

## Rules mirrored from the BFF

### Access control

- A process the user cannot view answers 404 (`process_not_found`), never 403: an invisible process must not reveal its existence. Admins can view and execute everything.
- `canExecute` is only effective when `canView` is also true.
- Admin operations (`deactivate`, `activate`, permissions, directory search, audit) fail with 403 `forbidden` ("Administrator role required") for non-admins.
- Unknown executions answer 404 `execution_not_found`; an execution of an invisible process also answers 404.

### Derived state

- Executions of a process are sorted newest first. The "last execution" is the newest one that is not `RUNNING`.
- Operational state: `disabled` when `disabledInfo` is set, else `running` if some execution is `RUNNING`, else `available`.
- A dependency rule is evaluated against the last finished execution of the reference process. It is unmet when: the reference never ran ("Reference process has never been executed"); the last result is not admitted ("Last result X is not admitted (...)"); or the last execution is older than `maxAgeHours` ("Last execution is older than N h"). Age is measured from the execution start.
- `lastSkippedAttempt` of a process summary is only reported when it is newer than the last finished execution.
- Process list order: by area, then by name.
- Execution detail: if the record has no stored evaluations (seeded executions), the dependencies are evaluated now and reported as met. Neighbour ids follow the newest-first ordering (`previousExecutionId` is the next older execution).

### Pagination and filters

- `pageSize` defaults to 25 and is clamped to 1..100; `page` defaults to 1 and is at least 1. Incidents default to a page size of 100.
- Date filters (`from`, `to`) are inclusive bounds on the start time (audit: on `occurredAtUtc`).
- Audit results are sorted newest first; the `user` filter is a case-insensitive match on the UPN. Directory search matches display name or UPN, case-insensitively, and returns at most 20 users.

### Deactivate / activate

- `deactivate` requires a non-blank reason (400 `reason_required`), and fails with 409 `already_disabled` if already disabled. It records `disabledInfo` (time, admin display name, trimmed reason) and an audit event `ProcessDeactivated`.
- `activate` fails with 409 `not_disabled` if the process is not disabled; it clears `disabledInfo` and audits `ProcessActivated`.

### Permissions (decision D-12)

`canExecute` implies `canView`, and removing `canView` removes `canExecute`:

- Granting `canExecute` alone also grants `canView`.
- Removing `canView` from an existing grant removes `canExecute` too.
- If the resulting `canView` is false the grant is deleted (audit `PermissionRevoked`, returns `null`); an existing grant is changed (`PermissionChanged`); otherwise a new grant is created (`PermissionGranted`). `revokePermission` is `setPermission` with both flags false.
- Unknown directory users answer 404 `user_not_found`; unknown processes 404 `process_not_found`.
- Audit `before` / `after` use the text format `canView=<bool>;canExecute=<bool>`.

### Manual execution

Checks run in this order:

1. The process must be visible (404 otherwise).
2. Idempotency replay (see below).
3. `canExecute` for the user, else 403 `forbidden`.
4. `manualActivationAllowed`, else 403 `manual_activation_not_allowed`.
5. Process disabled: 409 `disabled`.
6. Process already running: 409 `concurrency`.
7. Unmet dependencies: 409 `unmet_dependency`, with the unmet evaluations in `details`.

Each rejection is audited (`ManualExecutionRequested`, outcome `rejected`, reason = code) and the 409 rejections also add a manual `SkippedAttempt`. The error carries the audit `correlationId`. An accepted request creates a `RUNNING` manual, individual execution (`requestedBy` = user UPN) with an initial incident "Manual execution started", records the idempotency key, audits `accepted`, and schedules completion.

### Completion

After `executionDurationMs`, a still-`RUNNING` execution finishes with a random result: 70 percent `OK`, 20 percent `WARNING`, 10 percent `ERROR`. It records the finish time, a duration of at least 1 second, and a closing incident ("Execution finished", "Execution finished with warnings" or "Execution failed").

### Concurrency and idempotency

- Idempotency is keyed by `userObjectId:processId:idempotencyKey`. Replaying the same key returns the same `executionId` and does not create a second execution, even while the first one is still running and even if the user would now be rejected by later checks (the replay is evaluated right after visibility).
- Concurrency: one running execution per process; a second manual request is rejected with 409 `concurrency`.

### Audit

Every audited action stores a generated id, UTC time, current user, action, process/execution, before/after, outcome, reason and a correlation id.

## Seed data (`mockSeed.ts`)

All times are relative to the moment the app loads (`ago(hours)`).

### Processes

| Id | Name | Area | Notes |
|---|---|---|---|
| `fin-invoice-recon` | Daily invoice reconciliation | Finance | 58 executions (see below) |
| `fin-ledger-close` | Monthly ledger close | Finance | manual activation not allowed |
| `fin-payroll-import` | Legacy payroll import | Finance | disabled by Ana Admin 2 days ago; reason "Legacy HR export is being migrated; do not run until the new feed is ready." |
| `sales-extract` | Sales extract | Sales | chain step A |
| `sales-enrich` | Sales enrichment | Sales | chain step B; depends on `log-ext-pricing` (24 h, OK or WARNING) |
| `sales-aggregate` | Sales aggregation | Sales | chain step C; depends on `sales-enrich` (24 h, OK or WARNING) |
| `sales-publish` | Sales publish | Sales | chain step D; depends on `sales-extract` (24 h, OK only) |
| `sales-customer-export` | Customer data export | Sales | on demand; has a failed execution with long incident data |
| `sales-crm-sync` | CRM sync | Sales | never executed |
| `log-ext-pricing` | External pricing feed import | Logistics | external dependency X; last run failed |
| `log-inventory-sync` | Inventory synchronization | Logistics | has a RUNNING execution (`exec-inv-run`) |
| `log-shipment-track` | Shipment tracking update | Logistics | latest result WARNING |

Chain: `chain-nightly-sales` ("Nightly sales chain", Daily 02:00) with members `sales-extract`, `sales-enrich`, `sales-aggregate`, `sales-publish` in that order. This mirrors the documentation example 4: chain A>B>C>D, B depends on external X (failing), C depends on B.

### Executions and skipped attempts

- `fin-invoice-recon`: 58 executions (`exec-inv-001` to `exec-inv-058`, one per day) to exercise pagination and filters. Results: ERROR when `i % 11 === 4`, else WARNING when `i % 7 === 2`, else OK; manual (by `eva.employee@example.com`) when `i % 9 === 5`; one execution (`i === 1`) has no incidents.
- `fin-ledger-close`: `exec-led-1..4` (one WARNING, three OK) plus skipped attempt `skip-led-1` (concurrency).
- `fin-payroll-import`: `exec-pay-2` (OK), `exec-pay-1` (ERROR) and skipped `skip-pay-1` (disabled).
- Chain processes: `exec-sex-*` and `exec-spu-*` (5 each) and `exec-sen-*` and `exec-sag-*` (3 each), all OK, with chain order 1 to 4.
- External dependency X (`log-ext-pricing`): `exec-ext-1..4`; the last run (`exec-ext-4`) is ERROR, causing the skipped attempts of `sales-enrich` (`skip-sen-1`, `skip-sen-2`, unmet dependency X) and `sales-aggregate` (`skip-sag-1`, `skip-sag-2`, unmet dependency B because the last enrichment is older than 24 h).
- `sales-customer-export`: `exec-cus-1..3`, all manual (the last, an ERROR by Eva, has 120 stack lines in the last incident's `msgData`).
- `log-inventory-sync`: `exec-inv-run` (RUNNING) and `exec-ivs-1..6` (OK). `log-shipment-track`: `exec-shp-1..3`.
- Incidents are generated per result: OK, WARNING and ERROR have different message plans (including a `TRACE` raw type mapped to `other` for ERROR) and ERROR executions carry `msgData` (`{"status":503,"body":"Service Unavailable"}` or the long stack trace).

### Directory and permissions

- Directory: the four dev users plus `d-marta-0101` (marta.ruiz), `d-pablo-0102`, `d-lucia-0103`, `d-jordi-0104`, `d-sara-0105` and `d-tomas-0106`. One seeded account (`d-tomas-0106`) has left the company (`accountEnabled: false`) to exercise the warning in the permissions view.
- Eva: view and execute on `fin-invoice-recon`, `sales-extract`, `sales-enrich`, `sales-aggregate`, `sales-publish`, `sales-customer-export`, `log-inventory-sync`; view only on `fin-ledger-close`.
- Vic: view only on `fin-invoice-recon`, `fin-ledger-close`, `sales-extract`, `sales-enrich`, `sales-aggregate`, `sales-publish`, `log-shipment-track`, `sales-customer-export`.
- Nora has no permissions; Lucia (directory) can view and execute `log-ext-pricing`.
- Seeded audit: seven events (`aud-1` to `aud-7`) covering permission grant/change/revoke, accepted and rejected manual executions and a process deactivation.

## Source index

| File | Documented in section |
|---|---|
| `src/backend/providers/mock/createMockProviders.ts` | Latency and failure injection |
| `src/backend/providers/mock/mockConfig.ts` | Latency and failure injection |
| `src/backend/providers/mock/mockDb.ts` | Rules mirrored from the BFF |
| `src/backend/providers/mock/mockSeed.ts` | Seed data |
| `src/backend/providers/mock/mockSession.ts` | Session and dev users |
