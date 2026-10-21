---
title: Styles
navGroup: Styles
order: 1
---
# Styles (`src/styles`)

## Purpose

Documents how the core stylesheet is organised: the Tailwind design tokens, the SCSS partials that consume them, the shell layout rules and the component conventions. The styles of the out-of-scope module live in `src/oos/styles` and are described in [oos/ui.md](oos/ui.md).

## Tailwind and SCSS roles

- `src/styles/tailwind.css` imports Tailwind (`@import 'tailwindcss'`) and declares the design tokens in a single `@theme` block. It is the only place where raw colour and font values are defined.
- `src/styles/main.scss` holds the custom styles that go beyond utilities. It only forwards the partials, in this order: `base`, `shell`, `components`, `home`, `detail`, `admin`. Tokens come from `tailwind.css`.
- SCSS never repeats a token value: it reads it as a CSS variable, for example `var(--color-brand-500)`.

### Why `@theme static`

Tailwind normally emits a theme variable only when a utility uses it. The block is declared as `@theme static` so that every token is always emitted as a CSS variable, even when no utility references it. The tokens are therefore available both as Tailwind utilities and as plain CSS variables, which is how the SCSS partials consume them (for example `var(--color-brand-500)`).

Do not change it back to a plain `@theme`. Tailwind does not scan the SCSS partials, so with a plain `@theme` almost every variable the SCSS reads would be left undefined and backgrounds and colours would silently disappear (this happened once: only `--color-brand-500` was emitted). To check for it, compare the custom properties defined and used in the built CSS (`dist/assets/*.css`): none may be used without being defined, ignoring `--tw-*` and `--default-*`.

## Design tokens (`tailwind.css`)

| Group | Tokens | Notes |
|-------|--------|-------|
| Font | `--font-sans` (`'Segoe UI', system-ui, sans-serif`) | Same stack as `body` in `_base.scss`. |
| Brand (orange accent) | `--color-brand-50`, `-100`, `-500`, `-600`, `-700` | `500` is the accent (`#e8711a`, also used for focus rings and checkboxes); `700` is used for links and text on light backgrounds. |
| Surfaces | `--color-surface-sidebar`, `-topbar`, `-sidebar-hover`, `-page`, `-card`, `-muted` | Sidebar and topbar are dark; page, card and muted surfaces are light. |
| Borders and text | `--color-border-default`, `--color-text-default`, `-muted`, `-on-dark`, `-on-dark-muted` | The `on-dark` pair is for text over the sidebar and topbar. |
| Status (foreground / background tint) | `--color-status-{ok,warning,error,running,disabled}-fg` and `-bg` | Five tones; each has a foreground colour and a background tint. |
| Strong error | `--color-status-error-strong` | Error tone for text and borders on white, chosen so small text keeps AA contrast. It currently has the same value as `--color-status-error-fg` (`#b02a2a`), because the status foreground tokens were darkened for AA contrast on their tinted backgrounds; the separate token is kept for uses on white. |

## Application shell (`_shell.scss`)

- The shell is a dark sidebar plus a dark topbar around a light, scrolling content area. `.app-shell` is a CSS grid with two areas stacked as `sidebar topbar` / `sidebar content`; the variables `$sidebar-width` (220px) and `$topbar-height` (56px) size it, and the sidebar brand uses the topbar height so the two line up.
- `.content` is `position: relative` on purpose. It is the containing block for absolutely positioned descendants (for example `.sr-only` elements), so they are clipped by this scroll container instead of stretching the document past the viewport. Do not remove it.
- Below 1024px (`max-width: 1023px`) the sidebar collapses to a 64px rail: the brand text is replaced by a short mark and group labels and the footer are hidden.

## Responsive breakpoints

| Breakpoint | Where | Effect |
|------------|-------|--------|
| `max-width: 1023px` | `_shell.scss` | Sidebar collapses to a 64px rail. |
| `max-width: 1499px` | `_home.scss` (KPI cards) | Laptop widths: the five KPI cards plus the side card must share one row, so gap, padding, icon size and label size are reduced. |
| `min-width: 1500px` | `_home.scss` (`.workbench`) | The processes table needs about 900px with its optional columns. At 1500px or more the detail panel sits beside it in a second 350px column; below that the panel stacks under the table. |
| `min-width: 1280px` | `_admin.scss` (`.audit-payload`) | The before/after payloads of an audit row sit side by side in two columns instead of stacked. |
| `min-width: 1100px` | `_components.scss` (`.dl-grid--wide`) | The definition list lays out two label/value pairs per row. |

## Component partials (`_components.scss`)

Shared presentation: buttons, inputs, pills, cards, banners, tables, tabs, menus, dialogs and pagination. The file groups its rules in this order: buttons, inputs and fields, status pills, chips, cards, page states and banners, refresh bar and skeleton, tables, tabs, pagination, menu (details), dialogs, definition lists as a label/value grid, list rows, code block and disclosure. Its notable rules:

- **Status pills** (`.pill`): the status is shown as colour plus icon plus text, never colour alone (see [shared.md](shared.md)). The tone modifiers `--ok`, `--warning`, `--error`, `--running` and `--disabled` are generated from the status tokens; `--neutral` uses the muted surface. The default pill uses the disabled tone.
- **Count pill** (`.count-pill`): small count pill, for example incidents by type, with a tabular-numbers value.
- **Cards**: `.card` has header, title, header-end, action and body parts. `.card--pad` is a plain padded card with no card header, used for sections of the detail and admin pages. `.section-title` is the heading inside a card or tab panel.
- **Tables**: `.table-scroll` is the scroll wrapper. The boxed variant (`&--box`, used by the detail and admin pages) lets the wrapper own the outer border. The selectable variant (`&--selectable`) is the master-detail table of Home and Processes, made compact so it fits next to the detail panel; in it, long status labels (for example "skipped by unmet dependency") wrap instead of widening the table. `tbody tr.data-table__expansion` is the full-width row below an expanded data row. Cell helpers:
  - `data-table__nowrap`: dates, durations and counters; do not wrap, aligned digits.
  - `data-table__truncate`: long text on one line with an ellipsis (pair it with a `title` attribute).
  - `data-table__wrap`: long text that wraps cleanly inside a bounded width.
- **Tabs**: `.tabs` panels (`&__panel`) are cards, as in the original template. `.table-tabs` are the quick-filter tabs of the processes table.
- **Dialogs**: `dialog` resets the inherited cell and header alignment (`text-align: left`) because dialogs are mounted inside table cells and header actions and would otherwise inherit their alignment.
- **Definition lists**: `.dl-grid` renders a `dl` as a label/value grid; `&--ruled` separates it from the content above with a rule; `.dl-grid--compact` (in `_admin.scss`) is used by the disabled-info cell of the admin processes table.
- **Other**: `.list-rows` (clean list rows), `.code-block` (code or JSON block with an optional copy button) and `.disclosure` (native `<details>` disclosure).

## Page partials

- `_base.scss`: document reset (`html`, `body`, `#root` fill the viewport), body font and colours, link colour, checkbox/radio sizing with the brand accent, and the global `:focus-visible` outline (2px brand outline, 2px offset).
- `_home.scss`: the Home dashboard and the processes workbench (KPI cards, `.workbench`, `.running-strip`, `.filters`, `.process-name`, and the detail `.panel`). Inside the panel header a long state label wraps onto its own line instead of squeezing the process name.
- `_detail.scss`: process detail and execution detail views, plus the toolbar helpers shared with the admin pages. Main rules: page title and breadcrumb, header card (`.detail-header`, `.meta-grid`), manual run control and its messages (`.run-control`), tab panel sections (`.detail-section`), toolbars/filters (extends `.filters` of the home workbench; `.filters--card` removes the outer margin inside a plain card so the card padding rules), relations (`.chain` and the `.stepper`, whose items get a decorative connector arrow between steps) and execution detail (`.exec-nav`, `.panel-head`, `.count-list`, `.incident`).
- `_admin.scss`: admin pages (permissions, process activation, audit log): `.fieldset`, directory search results when adding a user (`.directory-user`), the compact `.dl-grid--compact` and the audit before/after payloads (`.audit-payload`).

## Conventions

- Class names follow BEM-style naming (`block__element`, `block--modifier`), written with SCSS `&` nesting.
- Every colour comes from a token; every status tone is paired with an icon and a text label.
- SCSS files carry no comments; their knowledge lives in this page.

## Source index

| File | Documented in section |
|------|-----------------------|
| `src/styles/main.scss` | Tailwind and SCSS roles |
| `src/styles/tailwind.css` | Why `@theme static`; Design tokens |
| `src/styles/_shell.scss` | Application shell; Responsive breakpoints |
| `src/styles/_components.scss` | Component partials |
| `src/styles/_home.scss` | Responsive breakpoints; Page partials |
| `src/styles/_detail.scss` | Page partials |
| `src/styles/_admin.scss` | Page partials; Component partials (definition lists) |
