---
title: Configuration 
navGroup: Configuration
order: 1
---
# Configuration (`src/config`)

## Purpose

Documents the runtime configuration read by `src/config/env.ts` from Vite environment variables. The variables and their commented examples live in `.env.example` (its comments stay in that file); this page records defaults and validation.

## Variables

| Variable | Field in `env` | Default | Notes |
|---|---|---|---|
| `VITE_BACKEND_MODE` | `backendMode` | `http` | `http` selects the HTTP providers; `mock` is an explicit opt-in for the in-memory backend; any other value throws |
| `VITE_API_BASE_URL` | `apiBaseUrl` | `/api/v1` | Base URL of the BFF, used in `http` mode |
| `VITE_AUTH_MODE` | `authMode` | `entra` | `entra` enables Microsoft Entra sign-in; `mock` is an explicit opt-in for mock auth; any other value throws |
| `VITE_ENTRA_CLIENT_ID` | `entraClientId` | empty | Required when `authMode` is `entra` |
| `VITE_ENTRA_TENANT_ID` | `entraTenantId` | empty | Required when `authMode` is `entra` |
| `VITE_API_SCOPE` | `apiScope` | empty | Required when `authMode` is `entra` |
| `VITE_ENTRA_REDIRECT_URI` | `entraRedirectUri` | `window.location.origin` | |
| `VITE_ENTRA_POST_LOGOUT_REDIRECT_URI` | `entraPostLogoutRedirectUri` | `window.location.origin` | |
| `VITE_ADMIN_ROLE` | `adminRole` | `Consola.Admin` | Role name that marks an administrator |

## Validation

- Entra values and `VITE_ADMIN_ROLE` are trimmed; unset or blank values count as empty. `VITE_API_BASE_URL` is used as given and falls back to the default only when it is unset or empty.
- `VITE_AUTH_MODE` and `VITE_BACKEND_MODE` are trimmed and matched exactly (case-sensitive). Unset or blank values use the secure defaults (`entra`, `http`); any other value throws at startup naming the variable and the accepted values. A build never falls back to mock silently: local development copies `.env.example`, which opts in to `mock`.
- With `VITE_AUTH_MODE=entra`, the app throws at startup if any of `VITE_ENTRA_CLIENT_ID`, `VITE_ENTRA_TENANT_ID` or `VITE_API_SCOPE` is missing, listing the missing names.
- The exported `env` object is built once when the module loads.

See [providers](backend/providers.md) for how `backendMode` and `authMode` select the implementation.

## Source index

| File | Documented in section |
|---|---|
| `src/config/env.ts` | Variables; Validation (this file had no comments; documented for completeness) |
