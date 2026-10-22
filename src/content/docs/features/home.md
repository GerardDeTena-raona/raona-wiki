---
title: Home
navGroup: Features
order: 1
---
# Home feature (`src/features/home`)

## Purpose

Documents the landing dashboard components in `src/features/home`: greeting header, KPI cards and the two summary cards. All of them receive the already loaded list of visible `ProcessSummary` items; the data loading itself lives in the processes feature (see [processes.md](processes.md), section "Dashboard helpers").

## Page (`pages/HomePage.tsx`)

`HomePage = withUser(withOverviewData(HomeView))`. It renders the greeting header, a top row with the KPI cards and the `home.sideCards` slot, the processes workbench (`ProcessesWorkbench`, see [processes.md](processes.md)) and a footer row with the two summary cards followed by the `home.footerCards` slot. The data comes from `withOverviewData`, so the polling and the degraded state are those of the processes feature.

## Components

- `GreetingHeader` (`components/GreetingHeader.tsx`): shows a greeting chosen by the Madrid hour (`greetingKeyFor`: morning from 06:00, afternoon from 12:00, night from 20:00) with the first name of the user (`firstNameOf`), the live date and time (the clock ticks every 30 seconds) and a system status pill. The `isDegraded` prop is true when a data query is degraded or failed, and switches the pill accordingly. It renders the `home.toolbar` slot next to the clock. Hour and date formatting come from `shared/lib/format` (see [../shared.md](../shared.md)).
- `KpiCards` (`components/KpiCards.tsx`): count cards for the visible processes: total, correct, with incidents, with errors and disabled. Each card links to the matching view of the processes page and renders the `home.kpiCardExtras` slot.
- `LatestExecutionsCard` (`components/LatestExecutionsCard.tsx`): the five most recent last executions across the visible processes. It relies on `latestExecutions` in `features/processes/lib/dashboard.ts`.
- `RecentIncidentsCard` (`components/RecentIncidentsCard.tsx`): up to five most recent processes whose last execution finished with WARNING or ERROR. It relies on `recentIncidentProcesses` in `features/processes/lib/dashboard.ts`, and loads the message of each execution with `withLatestIncident`.

## Source index

| File | Documented in section |
|---|---|
| `src/features/home/pages/HomePage.tsx` | Page |
| `src/features/home/components/GreetingHeader.tsx` | Components |
| `src/features/home/components/KpiCards.tsx` | Components |
| `src/features/home/components/LatestExecutionsCard.tsx` | Components |
| `src/features/home/components/RecentIncidentsCard.tsx` | Components |
