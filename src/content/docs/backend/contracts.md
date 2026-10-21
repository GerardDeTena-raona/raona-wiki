---
title: Contracts
navGroup: Backend 
order: 1
---
# Backend contracts (`src/backend/contracts`)

## Purpose

Documents the data contracts exchanged between the console and the backend (types in `src/backend/contracts/index.ts`): their shape, semantics and invariants. Both the HTTP providers and the mock backend implement these types; see [providers](providers.md) and [mock backend](mock-backend.md).

## Basic vocabulary

- `OperationalState`: `available`, `running` or `disabled`.
- `ExecutionResult`: `OK`, `WARNING` or `ERROR` (finished executions). `ExecutionStatus` adds `RUNNING` for executions in progress.
- `ExecutionActivation`: `automatic` or `manual`. `ExecutionStrategy`: `individual` or `chain`.
- `CurrentUser` is the signed-in user (`objectId`, `displayName`, `isAdmin`). `PersonRef` (`displayName`, `email`) identifies the owner of a process.
- `Page<T>` (`items`, `page`, `pageSize`, `total`) and `PageQuery` (`page`, `pageSize`) are the generic pagination contract.

## Dependencies and relations

- `DependencyEvaluation` is the evaluation of one dependency rule against its reference process: reference id/name and state, last execution time and result, `met` and `reasonUnmet`.
  - `maxAgeHours: null` means any age is accepted.
  - `admittedResults` lists the results of the reference process that satisfy the rule.
- `ProcessRef` is a light reference to another process. `viewable` is `false` when the current user cannot view the referenced process (the UI must then not link to it).
- `ChainRelation` describes a chain the process belongs to: `position` / `total`, optional `previous` and `next` references and all `members`.
- `DependentRelation` is a process that depends on this one (with the rule's `maxAgeHours` and `admittedResults`).
- `ProcessRelations` groups `chains`, `dependsOn` (evaluated dependencies) and `dependents`.

## Skipped attempts

- `SkipReason`: `unmet_dependency`, `concurrency` or `disabled`.
- `SkippedAttempt`: an activation (automatic or manual) that did not start. It carries the `unmetDependencies` evaluations when the reason is `unmet_dependency`.

## Processes

- `ProcessSummary` is the list item. `lastExecution` (`LastExecution`) is the last finished execution; `lastSkippedAttempt` is only present when the skipped attempt is newer than the last execution.
- `disabledInfo` (`DisabledInfo`: `at`, `by`, `reason`) is present when the process is disabled, in both `ProcessSummary` and `ProcessDetail`.
- `ProcessDetail` extends the summary with source/target systems, frequency, window, `manualActivationAllowed`, `estimatedDurationSeconds` and the current user's `permissions` (`ProcessPermissions`: `canView`, `canExecute`).

## Executions

- `ExecutionSummary` is the list item (times, activation, strategy, optional `chainId` / `chainOrder`, `result` as `ExecutionStatus`, optional `requestedBy`).
- `ExecutionDetail` adds the process id/name, the `evaluatedDependencies` and navigation between executions of the same process: `previousExecutionId` is the next older execution and `nextExecutionId` the next newer one, each only when it exists.
- `ExecutionQuery` extends `PageQuery` with `from`, `to`, `result` and `activation` filters.

## Manual execution

- `ManualExecutionRequest` carries the `idempotencyKey`; `ManualExecutionAccepted` returns the new `executionId`.
- A rejected request fails with a `BackendError` with status 409 (see [providers](providers.md)). The `code` is one of `ManualExecutionRejectionCode` (`unmet_dependency`, `concurrency`, `disabled`), and `details` has the shape `ManualExecutionRejectionDetails` (`unmetDependencies`).
- Other failures use different statuses: 403 (`forbidden`, `manual_activation_not_allowed`) and 404 (process not visible or not found) in the mock backend.

## Incidents

- `IncidentType`: `info`, `warning`, `error`, `debug` or `other`.
- `Incident.rawType` is the original type string as stored by the process; unknown types map to `other` in `msgType`. The optional `msgData` carries the structured or multi-line payload of the message (for example a JSON body or a stack trace).
- `IncidentSummary` is a count per `IncidentType`. `IncidentQuery` adds a `msgType` filter to `PageQuery`.

## Admin

- `ProcessPermission` is a grant (`canView`, `canExecute`) of one user on one process; `PermissionInput` is the pair of flags sent to change it.
- `DirectoryUser` is a directory entry. `accountEnabled` is `false` when the account is disabled or the person left the company; absent means enabled.
- Audit: `AuditAction` (`ManualExecutionRequested`, `ProcessDeactivated`, `ProcessActivated`, `PermissionGranted`, `PermissionChanged`, `PermissionRevoked`), `AuditOutcome` (`accepted`, `rejected`, `error`) and `AuditEvent` (UTC timestamp, user, action, optional process/execution, `before` / `after` description, outcome, `reason`, `correlationId`).
- `AuditQuery` extends `PageQuery` with `from`, `to`, `action`, `userObjectId`, `processId`, `outcome` and `user` (case-insensitive text match on the user's UPN).

## Source index

| File | Documented in section |
|---|---|
| `src/backend/contracts/index.ts` | All sections |
