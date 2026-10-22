import { getCollection } from 'astro:content';
import type { DocEntry, GroupedDocsAcc } from './types';

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

  return Object.entries(groupedDocs);
}
