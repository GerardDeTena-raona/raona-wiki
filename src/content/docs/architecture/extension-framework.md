---
title: Extension Framework
navGroup: Architecture
order: 1
---
# Extension framework and app shell

## Purpose

The core app exposes a small set of extension points (slots, navigation items, routes, table columns, row actions, row leading cells, row expansions, row filters and tabs). Optional modules plug into them by registering contributions. The main optional module is the out-of-scope (OOS) module in `src/oos`. This document describes the registry, the contribution kinds, the catalogue of extension point ids, the scope mode that hides OOS content, and the app shell pieces that consume them (`src/app/*`).

## Rules and invariants

- The core NEVER imports from `src/oos`. The optional module is discovered at build time by `src/app/extensions/autoload.ts`, which calls `import.meta.glob('../../oos/register.ts', { eager: true })`.
- When the `src/oos` folder does not exist, the glob matches nothing and the build still passes.
- `src/app/router.tsx` must import `./extensions/autoload` as its first import. Optional modules must be registered before the route table is built, because the router reads `getContributions('route')` at module evaluation time.
- Contributions are identified by `id`. Registering a contribution whose `id` already exists for the same kind is ignored (idempotent registration).

## How to remove the out-of-scope (OOS) features

Delete the `src/oos` folder. Nothing else needs to change: the glob simply matches nothing and no core file references the module.

## Registry (`src/app/extensions/registry.ts`)

- Holds one immutable list per contribution kind (`slot`, `navItem`, `route`, `tableColumn`, `rowAction`, `rowLeading`, `rowExpansion`, `rowFilter`, `tab`).
- Exposes `subscribe`, `getSnapshot`, `getContributions(kind)` and one `register*` helper per kind (`registerSlot`, `registerNavItem`, `registerRoute`, `registerTableColumn`, `registerRowAction`, `registerRowLeading`, `registerRowExpansion`, `registerRowFilter`, `registerTab`).
- `getSnapshot()` returns a stable snapshot: the store object is replaced only when something registers. This is what makes it safe for `useSyncExternalStore`.

## Contribution kinds (`src/app/extensions/types.ts`)

All kinds extend `ContributionBase` (`id`, optional `oos`).

| Kind | Interface | Notes |
|---|---|---|
| `slot` | `SlotContribution` | `slot`, `order`, `component`, optional `alwaysVisible`. |
| `navItem` | `NavItemContribution` | `group`, `order`, `labelKey`, `to`, `icon`, optional `requiresAdmin`. |
| `route` | `RouteContribution` | `path`, `element`. |
| `tableColumn` | `TableColumnContribution` | `table`, `order`, `header`, `cell(row)`. |
| `rowAction` | `RowActionContribution` | `table`, `order`, `render(row)`. |
| `rowLeading` | `RowLeadingContribution` | `table`, `order`, `render(row)`. |
| `rowExpansion` | `RowExpansionContribution` | `table`, `order`, `render(row)`. |
| `rowFilter` | `RowFilterContribution` | `table`, `order`, `params`, `predicate(row, searchParams)`. |
| `tab` | `TabContribution` | `slot`, `order`, `labelKey`, `component`. Extra tab of a tabbed slot (currently `processDetail.tabs`). |

Field semantics:

- `oos`: the contribution comes from the optional out-of-scope module.
- `alwaysVisible` (slots): stays visible even when the scope mode hides out-of-scope content.
- `labelKey` (nav items and tabs): i18n key, optionally namespaced (for example `oos:nav.calendar`).
- `header` (table columns): i18n key for the column header.
- `rowLeading.render`: content of the leading cell of a table row (for example an expand chevron).
- `rowExpansion.render`: content of the expansion row of an expanded table row.
- `rowFilter.params`: URL search params owned by this filter. They are kept across filter changes and removed on "Clear".
- `rowFilter.predicate`: true when the row passes the filter. It must accept every row while its params are unset.

## Extension point catalogue

Slot ids (type `SlotName`): `topbar.start`, `topbar.center`, `topbar.end`, `home.kpiCardExtras`, `home.sideCards`, `home.footerCards`, `home.toolbar`, `processes.toolbar`, `processes.filters`, `processDetail.tabs`, `processDetail.fields`, `processDetail.actions`, `sidebar.footer`.

Slots are rendered with `<Slot name=... context=...>` and receive the context as `SlotComponentProps.context` (`SlotContext` is `Record<string, unknown>`).

| Slot | Where it renders | Context |
|---|---|---|
| `home.toolbar` | Header of Home, next to the clock. | `{}` |
| `home.kpiCardExtras` | Inside every KPI card, below the count. | `{ kind, count, total }`, where `kind` is `'total' \| 'ok' \| 'warning' \| 'error' \| 'disabled'`. |
| `home.sideCards` | Right of the KPI row. | `{ counts }` |
| `home.footerCards` | Bottom row, after the in-scope cards. | `{}` |
| `processes.toolbar` | Next to the table title (for example an export button). | `{ rows }`: the `ProcessSummary[]` currently visible, after filters and sort. |
| `processes.filters` | Filter row, after the core filters. | `{ filters }`. To add a row filter, use the `rowFilter` kind and keep its value in a URL search param. |
| `processDetail.fields` | Inside the `<dl>` of the detail panel; render `<div><dt/><dd/></div>`. | `{ processId, process }` (`process`: `ProcessDetail`). |
| `processDetail.actions` | In the panel button row. | `{ processId, process }` |
| `processDetail.tabs` | Extra panel tabs: register them with the `tab` kind (`registerTab`, slot `processDetail.tabs`). | `{ processId, process }` |

Table contributions use the table id `processes` (the workbench table):

- `tableColumn`: extra column; `cell(row)` receives the `ProcessSummary`.
- `rowAction`: trailing actions cell; `render(row)`.
- `rowLeading`: leading cell (for example an expand chevron); `render(row)`.
- `rowExpansion`: extra content in a full-width row below a data row while that row is expanded; `render(row)`. The expanded state is shared through `useRowExpansion(tableId)` (`isExpanded` / `toggle` by row id). A leading-cell contribution typically renders the toggle button and sets `aria-expanded` and `aria-controls={getExpansionId(tableId, rowId)}`.
- `rowFilter`: extra predicate applied to the rows of the table, `predicate(row, searchParams)`. `params` lists the URL search params the filter owns: the table keeps them when other filters change and removes them on "Clear".

The shell renders the remaining slots without a context: `topbar.start` (before the app title), `topbar.center` (middle of the topbar), `topbar.end` (before the user chip) and `sidebar.footer` (footer of the sidebar).

## Hooks and components

- `useContributions(kind, key?)`: returns the contributions of one kind, ordered by `order` and already filtered by scope mode. `key` narrows by owner: the `slot` of a slot or tab contribution, or the `table` of a table contribution (`ownerOf`). Items with `oos` and without `alwaysVisible` are dropped when the mode is `document` (`isVisible`).
- `Slot`: renders every contribution registered for the slot, in order.
- `useTranslateKey()`: translates a dynamic (possibly namespaced) key coming from a contribution (`labelKey`, `header`).
- `RowExpansionContext` and `RowExpansionProvider`: hold the expanded row ids per table id (`Readonly<Record<string, ReadonlySet<string>>>`). Wrap the table and its contributions in the provider.
- `useRowExpansion(tableId)`: expanded state of the rows of one table. Without a provider, nothing is ever expanded.
- `getExpansionId(tableId, rowId)`: DOM id of the expansion row of a table row; it is the target of `aria-controls`.

## Scope mode

- The scope mode (`full` or `document`) decides whether OOS content is shown. It is persisted in `localStorage` under `SCOPE_MODE_STORAGE_KEY` (`console.scopeMode`) by `ScopeModeProvider`, which `App` mounts around the router; the default is `full`. Components read it with `useScopeMode()`, which returns `{ mode, setMode }`; without a provider the context value is `full` and `setMode` does nothing.
- If storage is unavailable (read or write fails), the provider falls back to `full` for reads and keeps only the in-memory value for writes.
- `ScopeGate` redirects to Home (`/`, replace) when the mode is `document`. `router.tsx` wraps every contributed route that has `oos` set in `ScopeGate`.

## App shell (`src/app`)

- `App` (`src/app/App.tsx`) nests `FluentProvider`, `AuthProvider`, the Redux `Provider`, `BackendProvider` and `ScopeModeProvider` around the `RouterProvider`.
- `coreNavItems` (`src/app/coreNavItems.ts`) lists the in-scope navigation (Home, Processes and the three admin pages). Optional modules add more through the extension registry.
- `AppShell` merges `coreNavItems` with the contributed `navItem`s, drops the ones with `requiresAdmin` for non-admin users, sorts by `order` and groups them by `group` (`main` first, then `admin`; any other group after them). The group label is translated from `shell:nav.groups.<group>`, and the `main` group has none. It also renders the topbar and sidebar slots, the user chip (initials, name, role) and the `<main>` content outlet.
- `router.tsx` builds the route table (home, processes, process detail, execution detail, the three admin pages and a `NotFoundPage` catch-all), adds contributed routes, and wraps the shell in `RequireAuth`. Its first import must be `./extensions/autoload`.
- `src/app/NavIcons.tsx` holds the icons of the core navigation items.
- `MockUserSwitcher` is a dev-only user picker, rendered only when the auth mode is `mock` (see [auth](../auth.md)).

## Source index

| File | Documented in section |
|---|---|
| `src/app/App.tsx` | App shell |
| `src/app/AppShell.tsx` | App shell; Extension point catalogue |
| `src/app/NavIcons.tsx` | App shell |
| `src/app/coreNavItems.ts` | App shell |
| `src/app/extensions/autoload.ts` | Rules and invariants; How to remove the OOS features |
| `src/app/extensions/registry.ts` | Rules and invariants; How to remove the OOS features; Registry |
| `src/app/extensions/RowExpansionContext.ts` | Hooks and components |
| `src/app/extensions/RowExpansionProvider.tsx` | Hooks and components |
| `src/app/extensions/ScopeGate.tsx` | Scope mode |
| `src/app/extensions/ScopeModeContext.ts` | Scope mode |
| `src/app/extensions/ScopeModeProvider.tsx` | Scope mode |
| `src/app/extensions/Slot.tsx` | Hooks and components |
| `src/app/extensions/types.ts` | Contribution kinds; Extension point catalogue |
| `src/app/extensions/useContributions.ts` | Hooks and components |
| `src/app/extensions/useRowExpansion.ts` | Hooks and components |
| `src/app/extensions/useScopeMode.ts` | Scope mode |
| `src/app/extensions/useTranslateKey.ts` | Hooks and components |
| `src/app/MockUserSwitcher.tsx` | App shell |
| `src/app/router.tsx` | Rules and invariants; App shell |
