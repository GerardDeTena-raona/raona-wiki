---
title: Admin 
navGroup: Features
order: 1
---
# Admin features (`src/features/admin`)

## Purpose

Documents the administration views: the audit log, the permissions editor and the process activation controls. All of them are intended to be mounted behind the admin gate (`withAdmin`, see [../state-and-hoc.md](../state-and-hoc.md)). The three pages (`AuditPage`, `PermissionsPage`, `ProcessesAdminPage`) are built as `withUser(withAdmin(withOverviewData(View), <NoAccess />))`: non-admins see the shared `NoAccess` message, and the process list comes from `withOverviewData` (see [processes.md](processes.md)). Routes: `/admin/audit`, `/admin/permissions` and `/admin/processes`.

## Audit (`audit`)

- `AuditTable`: read-only log. The audit trail is insert-only, so there are no edit or delete controls. `processName` maps a process id to its display name.
- `withAuditEvents`: loads one page of the audit log for the given query and handles loading and error states (the generic failure uses the shared `QueryErrorState`).
- `AuditPage`: filters live in the URL. The form (`AuditFiltersForm`) is remounted (`key={searchParams.toString()}`) when the URL filters change from outside the form (back/forward navigation). Applying filters or changing page replaces the history entry.
- `AuditResults`: empty state when nothing matches, the `AuditTable` and the shared `Pagination`.
- `lib/auditFilters.ts`:
  - `AuditFilters` has `from` and `to` as `yyyy-MM-dd`, `user`, `action`, `process`, `outcome` and `page`. URL params carry the same names; empty values are omitted and `page` only when greater than 1. Invalid actions, outcomes or pages fall back to empty / 1.
  - `toAuditQuery` converts the filters to the backend query (day start / end ISO, trimmed user, page size `AUDIT_PAGE_SIZE` = 25).
  - `actionLabel` and `outcomeLabel` translate the audit action and outcome (`admin:audit.actions.*`, `admin:audit.outcomes.*`).
  - `formatAuditPayload` pretty-prints a before/after value: JSON as-is; `key=value;...` pairs as an object (with `true` / `false` converted to booleans); anything else as text; empty as `-`.

## Permissions (`permissions`)

- Rule D-12 (`lib/permissionRules.ts`): Execute implies View. `withExecuteToggled` makes checking Execute also check View; `withViewToggled` makes unchecking View also uncheck Execute.
- `PermissionsPage`: the selected process lives in the `process` URL param (`ProcessSelector`); a param that matches no visible process shows a "not found" state.
- `PermissionsEditor`: unchecking View leaves no permission (D-12), so it is a removal and needs confirmation (`RemovePermissionDialog`). Every change runs through the `ActionResult` of the container and shows a success or error banner (with the correlation id on failure).
- `PermissionsTable`: `busyUserId` is the user whose change is in flight; its checkboxes are disabled.
- `DirectoryResults`: `existingUserIds` are the users that already have a permission on the selected process.
- `AddUserSection`: searches the directory (debounced) and lists matches that can be added with View permission.
- `withDirectorySearch`: searches the directory for the given (debounced) text. `query` is already debounced and an empty text performs no search; `results` is undefined while the first search is loading, and `errorMessage` carries the described failure.
- `withProcessPermissionTable`: loads the permissions of one process and wires the grant / change / revoke mutations as `onSet` and `onRevoke`, which resolve with an `ActionResult` (`toActionResult`, see [../shared.md](../shared.md)).

## Process activation (`processes`)

- `ProcessesAdminPage`: refresh bar, degraded state, the filters (`ProcessesAdminFilters`: state and name search, applied by `filterProcesses` in `lib/adminProcessFilters.ts`) and the table.
- `ProcessActivationControls`: deactivate / reactivate controls with confirmation dialogs, reusable from the admin views. Deactivating requires a reason (up to 500 characters) and lists the dependent processes as a warning; reactivating takes an optional reason. A failure is shown in the dialog with its correlation id. `user` is required by the admin gate that wraps the component; `isDisabled` is true when the process is currently disabled (the control then offers to reactivate it).
- `ProcessesAdminTable`: `renderActivation` renders the activation controls of one process.
- `withProcessActivation`: wires the activation mutations and the dependents list for the activation controls. `dependents` lists the processes that depend on this one; undefined while loading, and `dependentsFailed` is true when they could not be loaded. `onDeactivate(reason)` and `onActivate(reason?)` resolve with an `ActionResult`.

## Source index

| File | Documented in section |
|---|---|
| `src/features/admin/audit/components/AuditTable.tsx` | Audit |
| `src/features/admin/audit/containers/withAuditEvents.tsx` | Audit |
| `src/features/admin/audit/lib/auditFilters.ts` | Audit |
| `src/features/admin/audit/pages/AuditPage.tsx` | Audit |
| `src/features/admin/audit/pages/AuditResults.tsx` | Audit |
| `src/features/admin/audit/components/AuditFiltersForm.tsx` | Audit |
| `src/features/admin/permissions/components/DirectoryResults.tsx` | Permissions |
| `src/features/admin/permissions/components/PermissionsTable.tsx` | Permissions |
| `src/features/admin/permissions/containers/withDirectorySearch.tsx` | Permissions |
| `src/features/admin/permissions/containers/withProcessPermissionTable.tsx` | Permissions |
| `src/features/admin/permissions/lib/permissionRules.ts` | Permissions |
| `src/features/admin/permissions/pages/AddUserSection.tsx` | Permissions |
| `src/features/admin/permissions/pages/PermissionsEditor.tsx` | Permissions |
| `src/features/admin/permissions/pages/PermissionsPage.tsx` | Permissions |
| `src/features/admin/permissions/components/ProcessSelector.tsx` | Permissions |
| `src/features/admin/permissions/components/RemovePermissionDialog.tsx` | Permissions |
| `src/features/admin/processes/components/ProcessActivationControls.tsx` | Process activation |
| `src/features/admin/processes/components/ProcessesAdminFilters.tsx` | Process activation |
| `src/features/admin/processes/components/ProcessesAdminTable.tsx` | Process activation |
| `src/features/admin/processes/containers/withProcessActivation.tsx` | Process activation |
| `src/features/admin/processes/lib/adminProcessFilters.ts` | Process activation |
| `src/features/admin/processes/pages/ProcessesAdminPage.tsx` | Process activation |
