---
title: Shared
navGroup: Shared
order: 1
---
# Shared code (`src/shared`)

## Purpose

Documents the reusable UI components, helpers and theme in `src/shared`.

## Accessibility principle: status is never conveyed by colour alone

Every status is shown with a text label, and its visual tone is always paired with an icon and a text label. This applies to `StatusBadge`, `Banner` and the helpers in `status.ts`.

## Error helpers (`lib/errors.ts`)

- `isNotFoundError(error)` / `isForbiddenError(error)`: true for a 404 / 403 failure; used by `withProcess` to choose the page state.
- `getUnmetDependencies(error)`: reads the unmet dependencies carried by a 409 rejection.
- `describeError(error)`: user-facing message for a failed read (403, 404, 5xx and unknown failures). It also maps the 409 codes `already_disabled` and `not_disabled`.
- `describeRejection(error)`: user-facing outcome of a failed manual execution request (`RejectionView`). `kind` is `rejected` for a business rejection (409 or 403) and `error` for a technical failure.

## Action result helpers (`lib/actionResult.ts`)

- `ActionResult`: `{ ok: true }` or `{ ok: false; message; correlationId? }`.
- `toActionResult(outcome)`: awaits an RTK Query mutation outcome and maps a failure through `describeError` into an `ActionResult`.

## Formatting helpers (`lib/format.ts`)

- `formatDateTime`: ISO timestamp as `yyyy/MM/dd HH:mm:ss` in Europe/Madrid.
- `formatDuration`: duration in seconds as `hh:mm:ss`.
- `EMPTY_VALUE` (`-`): placeholder returned by `formatDateTime` and `formatDuration` for a missing or invalid value.
- `formatMaxAge(maxAgeHours)`: maximum age of a dependency result in hours, or "Cualquiera" when `null`.
- `toDateInputValue(daysAgo)`: `yyyy-MM-dd` value for date inputs, `daysAgo` days before now (local time).
- `dayStartIso` / `dayEndIso`: start / end of the given `yyyy-MM-dd` day (local time) as an ISO string, or `undefined` when empty.
- `formatLongDate`: long date in Spanish (for example "Miercoles, 24 de septiembre de 2026"), Europe/Madrid.
- `formatClock`: `HH:mm` clock time in Europe/Madrid.
- `getMadridHour`: hour of the day (0-23) in Europe/Madrid.

## Status helpers (`lib/status.ts`)

- Text labels: `getProcessStatusLabel` returns the text label of a process state; "Not executed" includes the reason of the last skipped attempt. `describeStrategy` returns the execution strategy text: individual, or chain with its order.
- Visual tone (`StatusTone`): always paired with an icon and a text label.
- `composeProcessStatusLabel(process, stateLabel, skipReasonLabel)`: single place that composes the process status text (the state label, plus the skip reason in parentheses for "Not executed"). `getProcessStatusLabel` calls it with the global i18n translators; `useStatusLabels().state` calls it with the reactive `t` and its own lowercase `skipReason` texts.
- `useStatusLabels` provides the Spanish labels of process states and execution results through i18next.

## Polling (`lib/polling.ts`)

- `RUNNING_POLL_MS` (10 s): polling interval shared by the containers that refresh a process or execution only while it is running.

## Hooks

- `useDebouncedValue(value, delayMs = 300)`: returns `value` after it has stopped changing for `delayMs`.
- `useNow(intervalMs = 30000)`: current time in ms, refreshed every `intervalMs`.

## Theme (`theme/fluentTheme.ts`)

`corporateTheme` is a Fluent light theme built from an orange brand ramp (accent `#e8711a` at step 90), with the `Segoe UI` font stack. `App` applies it through `FluentProvider`. The Redux `ui` slice also holds a `theme` value, but nothing reads or sets it yet: it is kept for a future dark theme.

## UI components (`ui`)

- `Banner`: inline message banner with tone colour, icon and content (never colour alone). Optional `role`: live region for `status` or `alert`, or a plain `note`.
- `Card`: titled white card with heading, optional `action` link (shown at the right of the title), optional `headerEnd` (extra content at the right of the title, for example the toolbar slot) and a body.
- `DependencyEvaluationTable`: `metHeader` is the header of the met column; its value is informational (based on the last execution).
- `ModalDialog`: native modal `<dialog>`; mount it to open it, unmount it to close it. `onClose` is called when the dialog is closed natively (Esc); the parent must unmount the dialog in response. `footer` holds action buttons in a fixed footer below the scrollable body.
- `NoAccess`: alert paragraph with the "no access" message.
- `NotFoundPage`: title plus a link back to the home page, used by the router for unknown routes.
- `Pagination`: previous/next navigation with a "page X of Y (N items)" status; `page` is 1-based and `onPageChange` receives the new page.
- `RefreshBar`: "last updated" text (from a timestamp in ms) plus a refresh button, disabled while fetching.
- `icons`: the icon components used by `StatusBadge`, `Banner` and the feature components.
- `PageState`: plain component for the mandatory page states (loading, degraded, empty, not found, forbidden, error with optional correlation id; the retry button appears only for `error` and `degraded`).
- `QueryErrorState`: error `PageState` built from a failed RTK Query result (`describeError` message and correlation id) with a retry callback. Used by the query containers for the generic failure branch.
- `ProcessLink`: links to the process detail only when the user can view it.
- `StatusBadge`: colour pill with tone colour, inline icon and text label.
- `Tabs`: ARIA tabs pattern with roving tabindex and arrow/Home/End keyboard support.

## Source index

| File | Documented in section |
|---|---|
| `src/shared/lib/actionResult.ts` | Action result helpers |
| `src/shared/lib/errors.ts` | Error helpers |
| `src/shared/lib/format.ts` | Formatting helpers |
| `src/shared/lib/polling.ts` | Polling |
| `src/shared/lib/status.ts` | Status helpers; Accessibility principle |
| `src/shared/lib/useDebouncedValue.ts` | Hooks |
| `src/shared/lib/useNow.ts` | Hooks |
| `src/shared/lib/useStatusLabels.ts` | Status helpers |
| `src/shared/theme/fluentTheme.ts` | Theme |
| `src/shared/ui/Banner.tsx` | UI components |
| `src/shared/ui/Card.tsx` | UI components |
| `src/shared/ui/DependencyEvaluationTable.tsx` | UI components |
| `src/shared/ui/icons.tsx` | UI components |
| `src/shared/ui/ModalDialog.tsx` | UI components |
| `src/shared/ui/NoAccess.tsx` | UI components |
| `src/shared/ui/NotFoundPage.tsx` | UI components |
| `src/shared/ui/PageState.tsx` | UI components |
| `src/shared/ui/Pagination.tsx` | UI components |
| `src/shared/ui/ProcessLink.tsx` | UI components |
| `src/shared/ui/QueryErrorState.tsx` | UI components |
| `src/shared/ui/RefreshBar.tsx` | UI components |
| `src/shared/ui/StatusBadge.tsx` | UI components; Accessibility principle |
| `src/shared/ui/Tabs.tsx` | UI components |
