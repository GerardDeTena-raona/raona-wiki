// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // GitHub Pages project site: https://gerarddetena-raona.github.io/raona-wiki/
  // Drop `base` if the site moves to a custom domain served from the root.
  site: 'https://gerarddetena-raona.github.io',
  base: '/raona-wiki',
  // Native i18n routing: en lives at `/`, the others under `/es/` and `/ca/`.
  // Keep these locales in sync with `src/i18n/utils.ts`.
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'ca'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  markdown: {
    shikiConfig: {
      // Both palettes are emitted as CSS variables; global.css picks one per theme.
      themes: { light: 'github-light', dark: 'github-dark-dimmed' },
      defaultColor: false,
    },
  },
});
