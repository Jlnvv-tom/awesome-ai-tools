import Fuse, { type IFuseOptions } from 'fuse.js';

import type { SearchDoc } from '@/types/site';

/** 客户端检索：索引按需 fetch，不进入首屏 JS */
const FUSE_OPTIONS: IFuseOptions<SearchDoc> = {
  includeScore: true,
  ignoreLocation: true,
  threshold: 0.36,
  keys: [
    { name: 'name', weight: 0.5 },
    { name: 'nameCn', weight: 0.3 },
    { name: 'tags', weight: 0.1 },
    { name: 'description', weight: 0.1 },
  ],
};

let docsPromise: Promise<SearchDoc[]> | null = null;

export function loadSearchDocs(): Promise<SearchDoc[]> {
  if (!docsPromise) {
    docsPromise = fetch('/api/search-index')
      .then((response) => {
        if (!response.ok) throw new Error(`搜索索引加载失败：HTTP ${response.status}`);
        return response.json() as Promise<SearchDoc[]>;
      })
      .catch((cause) => {
        docsPromise = null;
        throw cause;
      });
  }
  return docsPromise;
}

export function createSearcher(docs: SearchDoc[]) {
  return new Fuse(docs, FUSE_OPTIONS);
}

export function searchDocs(docs: SearchDoc[], query: string, limit = 40): SearchDoc[] {
  const keyword = query.trim();
  if (!keyword) return [];
  const lower = keyword.toLowerCase();
  const exact = docs.filter((doc) =>
    [doc.name, doc.nameCn ?? '', doc.id].some((value) => value.toLowerCase().includes(lower)),
  );
  const fuzzy = createSearcher(docs)
    .search(keyword, { limit })
    .map((result) => result.item);

  const merged: SearchDoc[] = [];
  const seen = new Set<string>();
  for (const doc of [...exact, ...fuzzy]) {
    if (seen.has(doc.id)) continue;
    seen.add(doc.id);
    merged.push(doc);
    if (merged.length >= limit) break;
  }
  return merged;
}
