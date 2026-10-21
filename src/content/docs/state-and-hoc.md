---
title: State & HOC
navGroup: State Management
order: 1
---
# State (store) and higher-order components

## Purpose

Documents the RTK Query layer in `src/store` and the higher-order components (HOCs) in `src/hoc`.

## Store and API layer

- `baseApi` uses `fakeBaseQuery<BackendError>()`: endpoints do not call HTTP directly; they call the injected providers.
- `ThunkExtra` is the shape of the `extra` argument injected into thunks and RTK Query endpoints (`{ providers: Providers }`).
- `getProviders(api)` reads the providers from the thunk `extra` argument of a `queryFn`.
- `toQueryResult(operation)` runs a provider call and shapes the outcome as an RTK Query `queryFn` result: `{ data }` on success, `{ error: BackendError }` on failure (via `toBackendError`).

- `createAppStore(providers)` (`src/store/store.ts`) builds the store with the `api` reducer, the `ui` reducer and the RTK Query middleware, and passes `{ providers }` as the thunk `extra` argument. The cache tags are `Process`, `Execution`, `Skipped`, `Relations`, `Incident`, `Permission` and `Audit`.
- The `ui` slice (`src/store/slices/uiSlice.ts`) holds a `theme` (`light` or `dark`) and a list of toasts with the actions `setTheme`, `pushToast` and `dismissToast`. Nothing dispatches those actions or reads the state yet; the slice is kept for a future dark theme and toast notifications.

### Cache invalidation rule for manual execution

`requestManualExecution` invalidates the tags `Process` (by id and `LIST`), `Execution`, `Skipped` and `Audit` (`LIST`) regardless of the outcome. Rejected requests also create skipped attempts and audit rows, so the data must be refreshed on both outcomes.

## Higher-order components

- `compose(...fns)` composes unary functions (such as HOCs) right to left: `compose(a, b)(x) === a(b(x))`.
- `setDisplayName(wrapper, hocName, Component)`: sets the `hocName(Component)` display name on a HOC wrapper (falling back to the component name) and returns the wrapper with its type preserved. Every HOC outside `src/oos`, including the feature containers, returns its wrapper through it; the HOCs in `src/oos` keep their own inline display name so that module stays self-contained.
- `withUser`: injects the current user; renders nothing until the user is loaded.
- `withAdmin`: renders the wrapped component only for administrators; otherwise renders the fallback.
- `withPermission`: renders the wrapped component only when the process grants the required permission flag.
- `withProcess`: reads `:id` from the route, loads the process and injects it. It handles the loading, not found, no permission (forbidden) and error states through `PageState`; the generic failure uses the shared `QueryErrorState`. Injected props (`WithProcessProps`): `process`, `lastUpdated` (timestamp in ms of the last successful load), `isRefreshing`, `refreshProcess`.
  - Polling: every 10 s (`RUNNING_POLL_MS`, shared in `src/shared/lib/polling.ts`) and only while the process is running. A second subscription to the same cache entry (`useGetProcessByIdQuery` with `skip: !running`) adds polling only while running, without affecting the main subscription.

## Source index

| File | Documented in section |
|---|---|
| `src/store/api/baseApi.ts` | Store and API layer |
| `src/store/api/endpoints/executionsApi.ts` | Cache invalidation rule for manual execution |
| `src/store/api/queryResult.ts` | Store and API layer |
| `src/store/store.ts` | Store and API layer |
| `src/store/slices/uiSlice.ts` | Store and API layer |
| `src/hoc/compose.ts` | Higher-order components |
| `src/hoc/displayName.ts` | Higher-order components |
| `src/hoc/withAdmin.tsx` | Higher-order components |
| `src/hoc/withPermission.tsx` | Higher-order components |
| `src/hoc/withProcess.tsx` | Higher-order components |
| `src/hoc/withUser.tsx` | Higher-order components |
