import { getCollection } from 'astro:content';
import { docTitles, groupLabels } from '@i18n/nav';
import { defaultLocale, hasLocalePrefix, type Locale } from '@i18n/utils';
import type { DocEntry } from './types';

export interface NavDoc {
  /** Locale-less doc id, e.g. `backend/contracts`. Stable across locales. */
  slug: string;
  title: string;
  /** English entry, or the translated one when `src/content/docs/<locale>/<slug>.md` exists. */
  entry: DocEntry;
  /** False when `entry` is the English fallback for a non-default locale. */
  translated: boolean;
}

export interface NavGroup {
  /** English `navGroup`, the stable key. */
  key: string;
  /** Label shown in the current locale. */
  label: string;
  docs: NavDoc[];
}

/** Reading order of the sidebar groups. Groups not listed here go last, alphabetically. */
const GROUP_ORDER = [
  'Architecture',
  'Core Services',
  'Backend',
  'Features',
  'Out-of-Scope (OOS)',
  'Styling & Testing',
];

const groupRank = (name: string) => {
  const rank = GROUP_ORDER.indexOf(name);
  return rank === -1 ? GROUP_ORDER.length : rank;
};

/** Resolves a doc for a locale: the translated file when present, the English one otherwise. */
export async function resolveDoc(locale: Locale, slug: string): Promise<NavDoc | undefined> {
  const all: DocEntry[] = await getCollection('docs');
  const base = all.find((d) => d.id === slug);
  if (!base) return undefined;

  const translation =
    locale === defaultLocale ? undefined : all.find((d) => d.id === `${locale}/${slug}`);
  const entry = translation ?? base;

  return {
    slug,
    entry,
    translated: locale === defaultLocale || Boolean(translation),
    title: translation?.data.title ?? docTitles[locale]?.[slug] ?? base.data.title,
  };
}

/**
 * Docs grouped by the English `navGroup` and sorted by `order`: the single source
 * for sidebar, pager and home. Grouping and order always come from the English
 * entries so every locale shares one structure; only labels change.
 */
export async function getNavGroups(locale: Locale = defaultLocale): Promise<NavGroup[]> {
  const all: DocEntry[] = await getCollection('docs');
  const base = all.filter((d) => !hasLocalePrefix(d.id));

  const grouped = new Map<string, DocEntry[]>();
  for (const doc of base) {
    const key = doc.data.navGroup?.trim() || 'General';
    grouped.set(key, [...(grouped.get(key) ?? []), doc]);
  }

  const groups: NavGroup[] = [];
  for (const [key, docs] of grouped) {
    docs.sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99));
    const resolved = await Promise.all(docs.map((d) => resolveDoc(locale, d.id)));
    groups.push({
      key,
      label: groupLabels[locale]?.[key] ?? key,
      docs: resolved.filter((d): d is NavDoc => d !== undefined),
    });
  }

  return groups.sort((a, b) => groupRank(a.key) - groupRank(b.key) || a.key.localeCompare(b.key));
}
