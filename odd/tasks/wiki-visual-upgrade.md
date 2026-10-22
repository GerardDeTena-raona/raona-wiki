# Feature: wiki-visual-upgrade

## Objective
Raise the wiki UI to the quality bar of modern developer docs (Vercel/Linear/Stripe-docs class) for frontend-engineer readers, keeping the current palette (accent `#f78c38`, ink `#181923`).

## Scope / constraints
- Style + UX only: no content changes, no new heavy dependencies.
- Dark + light themes (system default, manual toggle, persisted, no flash).
- Must not hurt UX: reduced-motion respected, AA contrast, keyboard accessible, mobile drawer.
- TDD: not applicable (CSS/markup). Runner: none. Checks: `astro check`, `astro build`.
- Delivery: ~single slice; strategy `ask-on-risk`.

## Tasks
- [x] T1 Design tokens (light/dark), typography, shiki dual theme config, global base — route: inline (design cohesion; subagent would need the whole design brief)
- [x] T2 Shell: glass topbar, theme toggle, mobile drawer, sidebar polish + filter
- [x] T3 Doc page: breadcrumb, header, TOC with scroll-spy, anchors, code copy, prev/next
- [x] T4 Home: hero + group cards
- [x] T5 Verify: astro check + build
- [x] T6 Visual check (Edge headless): dark, light, mobile 390px OK; tweaked inline code weight

## Progress / evidence
(branch `feat/wiki-visual-upgrade`)
- T1-T5 done inline (single cohesive design pass). astro check: 0 errors/warnings; astro build: 20 pages OK; shiki dual-theme output verified with a temp doc (data-language + --shiki-* vars). NOT verified: visual render in a browser.
