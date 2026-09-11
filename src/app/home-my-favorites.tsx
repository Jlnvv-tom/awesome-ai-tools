'use client';

import { Flame } from 'lucide-react';

import { useUsageStats } from '@/components/personalization-provider';
import { SiteCard } from '@/components/site/site-card';
import { Badge } from '@/components/ui/badge';
import { DEFAULT_LOCALE, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import type { Site } from '@/types/site';

/**
 * 首页「我的常用」区块。
 *
 * 排序来自本浏览器的访问与收藏统计（不上传、不跨用户），
 * 本地无数据时整块不渲染，避免出现无意义的空区块。
 */
export function HomeMyFavorites({
  sites,
  locale = DEFAULT_LOCALE,
}: {
  sites: Site[];
  locale?: Locale;
}) {
  // 客户端组件自行取字典，避免把字典对象序列化穿过 server→client 边界
  const dict = getDictionary(locale).myFavorites;
  const { top, ready } = useUsageStats();
  const ranked = top(8)
    .map((id) => sites.find((site) => site.id === id))
    .filter((site): site is Site => Boolean(site));

  if (!ready || ranked.length === 0) return null;

  return (
    <section className="container pb-12">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <Flame className="h-4 w-4 text-accent" />
            {dict.title}
          </h2>
          <p className="text-sm text-muted-foreground">{dict.description}</p>
        </div>
        <Badge variant="outline" className="shrink-0 font-mono">
          {ranked.length}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {ranked.map((site) => (
          <SiteCard key={site.id} site={site} locale={locale} />
        ))}
      </div>
    </section>
  );
}
