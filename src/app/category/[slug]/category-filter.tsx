'use client';

import { useMemo, useState } from 'react';

import { SiteCard } from '@/components/site/site-card';
import { SiteRow } from '@/components/site/site-row';
import { SiteViewToggle } from '@/components/site/site-view-toggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { useViewMode } from '@/lib/view-mode';
import type { Site } from '@/types/site';

/** 分类页筛选工具条（页面私有客户端组件） */
export function CategoryFilter({ sites }: { sites: Site[] }) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const { view, setView } = useViewMode();

  const tags = useMemo(() => {
    const counter = new Map<string, number>();
    for (const site of sites) {
      for (const tag of site.tags) counter.set(tag, (counter.get(tag) ?? 0) + 1);
    }
    return [...counter.entries()].sort((a, b) => b[1] - a[1]).slice(0, 16);
  }, [sites]);

  const filtered = useMemo(
    () => (activeTag ? sites.filter((site) => site.tags.includes(activeTag)) : sites),
    [sites, activeTag],
  );

  return (
    <div className="space-y-6">
      <div className="glass-card flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
        <div className="scrollbar-none flex gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTag(null)}
            aria-pressed={activeTag === null}
            className={cn(
              'shrink-0 rounded-full border px-3 py-1 text-xs transition-colors',
              activeTag === null
                ? 'border-primary/50 bg-primary/15 text-primary'
                : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            全部 {sites.length}
          </button>
          {tags.map(([tag, count]) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(tag === activeTag ? null : tag)}
              aria-pressed={activeTag === tag}
              className={cn(
                'shrink-0 rounded-full border px-3 py-1 text-xs transition-colors',
                activeTag === tag
                  ? 'border-primary/50 bg-primary/15 text-primary'
                  : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {tag} {count}
            </button>
          ))}
        </div>

        <SiteViewToggle view={view} onChange={setView} />
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card flex flex-col items-center gap-2 py-16 text-center">
          <p className="text-sm text-muted-foreground">该标签下暂无工具，换个标签看看</p>
          <Button variant="outline" size="sm" onClick={() => setActiveTag(null)}>
            清除筛选
          </Button>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((site) => (
            <SiteCard key={site.id} site={site} />
          ))}
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((site) => (
            <li key={site.id}>
              <SiteRow site={site} />
            </li>
          ))}
        </ul>
      )}

      {filtered.length > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          共 {filtered.length} 个工具
          {activeTag && <Badge className="ml-2">已按「{activeTag}」筛选</Badge>}
        </p>
      )}
    </div>
  );
}
