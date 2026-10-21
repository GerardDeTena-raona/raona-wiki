import type { CollectionEntry } from "astro:content";

export interface BasicComponentProps {
    title: string;
    description?: string;
}

export type DocEntry = CollectionEntry<'docs'>;
export interface GroupedDocsAcc {
    [groupName: string]: DocEntry[];
}