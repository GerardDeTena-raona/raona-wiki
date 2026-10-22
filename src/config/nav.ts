import { getCollection } from 'astro:content';
import type { DocEntry, GroupedDocsAcc } from './types';

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

/** Docs grouped by `navGroup` and sorted by `order`: the single source for sidebar and pager. */
export async function getNavGroups(): Promise<[string, DocEntry[]][]> {
  const allDocs: DocEntry[] = await getCollection('docs');

  const groupedDocs = allDocs.reduce<GroupedDocsAcc>((acc, doc) => {
    const group = doc.data.navGroup?.trim() || 'General';

    (acc[group] ??= []).push(doc);
    return acc;
  }, {});

  Object.values(groupedDocs).forEach(docs => {
    docs.sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99));
  });

  return Object.entries(groupedDocs).sort(
    ([a], [b]) => groupRank(a) - groupRank(b) || a.localeCompare(b),
  );
}
