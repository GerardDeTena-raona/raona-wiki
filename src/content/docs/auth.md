---
title: Authentication
navGroup: Authentication
order: 1
---
# Authentication

## Purpose

Describes the authentication layer in `src/auth` (including `src/auth/entra`): mock mode for development and Microsoft Entra sign-in.

## Mock authentication

- The app supports an auth mode `mock` used for development. In this mode `AuthProvider` renders `MockAuthProvider`, which additionally exposes a `MockAuthState` through `MockAuthContext`.
- `MockAuthState` is a mock-only extension of the auth context. It lets the developer switch the signed-in user: `mockUsers` (list of `MockUser`), `currentUserId`, and `switchUser(objectId)`.
- `useMockAuth()` throws if it is used outside the mock `AuthProvider`.
- The dev-only `MockUserSwitcher` component (see [extension framework and app shell](architecture/extension-framework.md)) is rendered only when the auth mode is `mock`.

## Entra

- `AuthProvider` renders `EntraAuthProvider` (lazy loaded) only when `authMode` is `entra`; any other value renders the mock provider. `initializeAuth` and `getAccessToken` also load the `entra` modules on demand, so the MSAL code stays out of the mock bundle.
- `getCurrentAccount()` (`msalInstance.ts`) returns the active MSAL account, falling back to the first cached account. `EntraAuthProvider`, `acquireAccessToken` and `createEntraSessionProvider` resolve the signed-in user through the same rule.
- The user id, display name and UPN come from `toAuthUser(account)` (`localAccountId`, `name` or `username`, `username`). `hasAdminRole(account)` is true when the `roles` claim of the ID token contains `env.adminRole`.
- `acquireAccessToken()` acquires a token silently and redirects to sign-in when interaction is required (it then returns `null`).

## Source index

| File | Documented in section |
|---|---|
| `src/auth/MockAuthContext.ts` | Mock authentication |
| `src/auth/mockAuthState.ts` | Mock authentication (builds the `AuthState` of a `MockUser`) |
| `src/auth/AuthProvider.tsx` | Entra |
| `src/auth/entra/msalInstance.ts` | Entra |
| `src/auth/entra/claims.ts` | Entra |
