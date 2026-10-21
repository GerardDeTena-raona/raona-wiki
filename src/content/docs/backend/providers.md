---
title: Providers
navGroup: Backend
order: 3
---
# Backend providers (`src/backend`)

## Purpose

Documents the provider abstraction the UI uses to talk to the backend: the interfaces in `providers/types.ts`, `BackendError`, `createProviders`, the HTTP implementation and the React wiring (`BackendProvider`, `BackendContext`, `useProviders`). Data types are described in [contracts](contracts.md); the mock implementation in [mock backend](mock-backend.md).

## Provider interfaces (`providers/types.ts`)

`Providers` groups five providers: `session`, `processes`, `executions`, `incidents` and `admin`.

- `ProcessesProvider`: `list`, `getById`, `getRelations`, `deactivate(id, reason)` and `activate(id, reason?)`. `deactivate` and `activate` are admin only.
- `ExecutionsProvider.requestManualExecution` rejects with a `BackendError` (status 409) carrying `code` and `details` when the request is not accepted.
- `AdminProvider`: every operation requires an admin; non-admins get a 403.
  - `setPermission` grants or changes a permission; both flags `false` revokes it (and then resolves with `null`).

## `BackendError`

Error shaped after an RFC 9457 Problem Details response (`status`, `code`, optional `correlationId`). `code` defaults to `unknown_error`. `details` holds extra structured data from the problem body, for example the unmet dependencies on a 409.

`toBackendError(error)` returns a `BackendError` unchanged and wraps any other thrown value in one with status 0 and code `unexpected_error`. The store layer uses it to shape every failure as a `BackendError` (see [state and HOCs](../state-and-hoc.md)).

## Selecting the implementation (`createProviders`)

- `env.backendMode === 'http'` builds `createHttpProviders(env.apiBaseUrl, getAccessToken)`; any other value builds the mock providers.
- When `env.authMode === 'entra'`, the `session` provider is replaced by `createAuthSessionProvider()` (the signed-in Entra user); otherwise the backend's own session provider is used.
- See [configuration](../configuration.md) for the variables involved.

## React wiring

- `BackendProvider` receives a `Providers` object and exposes it through `BackendContext`.
- `useProviders()` returns the providers and throws `useProviders must be used within a BackendProvider` when used outside the provider.

## HTTP providers (`providers/http/createHttpProviders.ts`)

The REST paths below are ASSUMPTIONS to be aligned with the real BFF contract. They are relative to `apiBaseUrl` (trailing slashes are removed).

| Provider operation | Method and path |
|---|---|
| `session.getCurrentUser` | `GET /me` |
| `processes.list` | `GET /processes` |
| `processes.getById` | `GET /processes/{id}` |
| `processes.getRelations` | `GET /processes/{id}/dependencies` plus `GET /processes/{id}/chains` (two requests in parallel; the first returns `dependsOn` and `dependents`, the second the chains, merged into `ProcessRelations`) |
| `processes.deactivate` | `POST /processes/{id}/deactivate` with body `{ reason }` |
| `processes.activate` | `POST /processes/{id}/activate` with body `{ reason }` |
| `executions.listByProcess` | `GET /processes/{id}/executions` (query: pagination and filters) |
| `executions.getById` | `GET /executions/{id}` |
| `executions.listSkippedAttempts` | `GET /processes/{id}/skipped-attempts` |
| `executions.requestManualExecution` | `POST /processes/{id}/manual-executions` with the `Idempotency-Key` header and no body |
| `incidents.listByExecution` | `GET /executions/{id}/incidents` |
| `incidents.summaryByExecution` | `GET /executions/{id}/incidents/summary` |
| `admin.listPermissions` | `GET /admin/processes/{id}/permissions` |
| `admin.setPermission` | `PUT /admin/processes/{id}/permissions/{userObjectId}` with body `PermissionInput` |
| `admin.revokePermission` | `DELETE /admin/processes/{id}/permissions/{userObjectId}` |
| `admin.searchDirectoryUsers` | `GET /admin/directory-users?query=...` |
| `admin.queryAudit` | `GET /admin/audit` (query: pagination and filters) |

Path segments are URL-encoded.

### Requests

- Headers: `Accept: application/json`; `Authorization: Bearer <token>` when `getAccessToken` returns a token; `Content-Type: application/json` only when there is a body.
- Query strings are built from the query object: `undefined` and empty-string values are skipped.
- A `204` response, or an empty body, resolves with `undefined`.
- Manual execution idempotency: the `idempotencyKey` is sent in the `Idempotency-Key` header; the same key must replay the same outcome (the mock backend implements this, see [mock backend](mock-backend.md)).

### Error mapping (`toError`)

Any non-2xx response becomes a `BackendError` with the HTTP status. The Problem Details body may carry `title`, `detail`, `code`, `correlationId` and `unmetDependencies`.

- Message: `detail`, else `title`, else the response status text. When the body is not JSON the status text is used.
- Correlation id: `correlationId` from the body, else the `x-correlation-id` response header.
- `code` comes from the body `code`; `details` is `{ unmetDependencies }`.

## Source index

| File | Documented in section |
|---|---|
| `src/backend/BackendContext.ts` | React wiring |
| `src/backend/BackendProvider.tsx` | React wiring |
| `src/backend/useProviders.ts` | React wiring |
| `src/backend/providers/createProviders.ts` | Selecting the implementation |
| `src/backend/providers/types.ts` | Provider interfaces |
| `src/backend/providers/BackendError.ts` | `BackendError` |
| `src/backend/providers/http/createHttpProviders.ts` | HTTP providers |
