'use client';

import { Heart, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { useFavorites } from '@/components/personalization-provider';
import { SiteCard } from '@/components/site/site-card';
import { SiteRow } from '@/components/site/site-row';
import { SiteViewToggle } from '@/components/site/site-view-toggle';
import { Button } from '@/components/ui/button';
import { DEFAULT_LOCALE, localePath, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { useViewMode } from '@/lib/view-mode';
import type { Site } from '@/types/site';

/** 收藏页：内容完全来自本地收藏，服务端只提供全量数据用于匹配 */
export function FavoritesView({
  sites,
  locale = DEFAULT_LOCALE,
}: {
  sites: Site[];
  locale?: Locale;
}) {
  const dict = getDictionary(locale).favoritesPage;
  const viewDict = getDictionary(locale).explorer;
  const { ids, clear, ready } = useFavorites();
  const { view, setView } = useViewMode();
  const [confirming, setConfirming] = useState(false);

  const collected = sites.filter((site) => ids.includes(site.id));
  const loading = !ready;

  return (
    <div className="container space-y-8 pb-16 pt-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Heart className="h-5 w-5 text-primary" />
            {dict.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{dict.description}</p>
        </div>

        <div className="flex items-center gap-2">
          <SiteViewToggle
            view={view}
            onChange={setView}
            labels={{
              group: viewDict.switchView,
              grid: viewDict.gridView,
              list: viewDict.listView,
            }}
          />
          {collected.length > 0 &&
            (confirming ? (
              <span className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => {
                    clear();
                    setConfirming(false);
                  }}
                >
                  {dict.confirmClear}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                  {dict.cancel}
                </Button>
              </span>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setConfirming(true)}>
                <Trash2 className="h-3.5 w-3.5" />
                {dict.clear}
              </Button>
            ))}
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="glass-card h-36 animate-pulse" />
          ))}
        </div>
      ) : collected.length === 0 ? (
        <div className="glass-card flex flex-col items-center gap-3 py-20 text-center">
          <Heart className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{dict.empty}</p>
          <Button asChild variant="outline" size="sm">
            <Link href={localePath(locale)}>{dict.goHome}</Link>
          </Button>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {collected.map((site) => (
            <SiteCard key={site.id} site={site} locale={locale} />
          ))}
        </div>
      ) : (
        <ul className="space-y-2">
          {collected.map((site) => (
            <li key={site.id}>
              <SiteRow site={site} locale={locale} />
            </li>
          ))}
        </ul>
      )}

      {!loading && collected.length > 0 && (
        <p className="text-center text-xs text-muted-foreground">{dict.count(collected.length)}</p>
      )}
    </div>
  );
}
