'use client';

import { Heart, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { useFavorites } from '@/components/personalization-provider';
import { SiteCard } from '@/components/site/site-card';
import { SiteRow } from '@/components/site/site-row';
import { SiteViewToggle } from '@/components/site/site-view-toggle';
import { Button } from '@/components/ui/button';
import { useViewMode } from '@/lib/view-mode';
import type { Site } from '@/types/site';

/** 收藏页：内容完全来自本地收藏，服务端只提供全量数据用于匹配 */
export function FavoritesView({ sites }: { sites: Site[] }) {
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
            我的收藏
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            收藏仅保存在本浏览器，无需登录，也不会上传。
          </p>
        </div>

        <div className="flex items-center gap-2">
          <SiteViewToggle view={view} onChange={setView} />
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
                  确认清空
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                  取消
                </Button>
              </span>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setConfirming(true)}>
                <Trash2 className="h-3.5 w-3.5" />
                清空收藏
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
          <p className="text-sm text-muted-foreground">
            还没有收藏任何工具，点击卡片右上角的心形即可收藏
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/">去首页逛逛</Link>
          </Button>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {collected.map((site) => (
            <SiteCard key={site.id} site={site} />
          ))}
        </div>
      ) : (
        <ul className="space-y-2">
          {collected.map((site) => (
            <li key={site.id}>
              <SiteRow site={site} />
            </li>
          ))}
        </ul>
      )}

      {!loading && collected.length > 0 && (
        <p className="text-center text-xs text-muted-foreground">共 {collected.length} 个收藏</p>
      )}
    </div>
  );
}
