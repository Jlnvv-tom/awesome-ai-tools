import { Clock, Sparkles } from 'lucide-react';

import { SiteCard } from '@/components/site/site-card';
import { Badge } from '@/components/ui/badge';
import type { Site } from '@/types/site';

const DAY_MS = 24 * 60 * 60 * 1000;

/** 收录日期转相对时间，超过一个月直接显示日期 */
function relativeDay(day: string, today: string): string {
  const diff = Math.round((Date.parse(today) - Date.parse(day)) / DAY_MS);
  if (Number.isNaN(diff)) return day;
  if (diff <= 0) return '今天收录';
  if (diff === 1) return '昨天收录';
  if (diff < 7) return `${diff} 天前收录`;
  if (diff < 30) return `${Math.floor(diff / 7)} 周前收录`;
  return `${day} 收录`;
}

/**
 * 首页「本周新增工具」区块（服务端组件）。
 *
 * 时间窗口内无新增时自动降级为「最近收录」，由调用方通过 `withinDays` 告知；
 * 数据为空时不渲染，避免出现空白区块。
 */
export function HomeNewArrivals({
  sites,
  withinDays = false,
}: {
  sites: Site[];
  withinDays?: boolean;
}) {
  if (sites.length === 0) return null;

  const today = new Date().toISOString().slice(0, 10);

  return (
    <section className="container pb-12 pt-2">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <Sparkles className="h-4 w-4 text-primary" />
            {withinDays ? '本周新增' : '最近收录'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {withinDays ? '最近 7 天新收录的工具' : '近期收录的工具，按收录时间排序'}
          </p>
        </div>
        <Badge variant="outline" className="shrink-0 gap-1 font-mono">
          <Clock className="h-3 w-3" />
          {sites.length}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sites.map((site) => (
          <div key={site.id} className="flex h-full flex-col gap-1.5">
            <SiteCard site={site} />
            <p className="flex items-center gap-1 pl-1 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              {relativeDay(site.addedAt, today)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
