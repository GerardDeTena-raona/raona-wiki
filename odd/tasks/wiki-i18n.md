# Feature: wiki-i18n

## Objective
Translate the wiki using Astro's native i18n routing: `en` (default, `/`), `es` (`/es/`), `ca` (`/ca/`).

## Decisions (user-confirmed)
- Locales/default: en (no prefix), es, ca.
- Docs bodies stay English; missing translations fall back to English with a notice.
- UI strings, sidebar group names and doc titles are translated.

## Design
- `astro.config`: native `i18n` block (`prefixDefaultLocale: false`).
- `src/i18n/ui.ts` (UI dictionary + `useTranslations`), `src/i18n/nav.ts` (group + title dictionaries), `src/i18n/utils.ts` (locale helpers, URL helpers on `astro:i18n`).
- Pages are thin wrappers: `src/pages/*` (en) and `src/pages/[locale]/*` (es, ca) render shared `HomePage` / `DocPage` components.
- Optional real translations: drop `src/content/docs/<locale>/<same path>.md`; it overrides the English body for that locale.
- Language switcher in topbar keeps the current page; `hreflang` alternates in head.

## Constraints
- No new dependencies. TDD: not applicable (no runner). Checks: `astro check`, `astro build`, headless Edge visual check.
- Git: commits yes, push/PR NO (user instruction).

## Tasks
- [x] T1 i18n config + dictionaries + helpers
- [x] T2 Content schema/nav: locale-aware `getNavGroups`, translated titles/groups
- [x] T3 Layout/sidebar/script: translated UI, lang attr, switcher, hreflang
- [x] T4 Pages: shared Home/Doc components, `[locale]` routes, fallback notice
- [x] T5 Verify: check + build + route list + visual

Route: inline (strings and routing are tightly coupled; a writer would need the whole design).

## Progress / evidence
(branch `feat/wiki-i18n`, stacked on `feat/wiki-visual-upgrade`)
- All tasks done inline. astro check: 0 errors; build: 60 pages (3 locales x 20). Verified in built HTML: html lang, translated titles/groups, localized links, fallback notice (ca/auth). Visual check (Edge headless): es home, ca doc OK.
- Not verified: language switcher click-through with ClientRouter, no real translated body yet (drop src/content/docs/<locale>/<slug>.md to add one).
- hreflang only emitted when `site` is set in astro.config (currently unset).
