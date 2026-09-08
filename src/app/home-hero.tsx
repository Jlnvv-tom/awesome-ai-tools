import { Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { ICON_SYNCED_AT } from '@/data/icons.generated';
import type { SiteStats } from '@/types/site';

/** 首页 Hero：渐变光斑 + 数据统计（页面私有组件，与 page.tsx 就近放置） */
export function HomeHero({ stats }: { stats: SiteStats }) {
  const syncedDate = new Date(ICON_SYNCED_AT).toISOString().slice(0, 10);

  return (
    <section className="relative overflow-hidden pb-16 pt-20 md:pb-20 md:pt-28">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute -left-24 top-0 h-72 w-72 animate-aurora-shift rounded-full bg-primary/25 blur-[100px]" />
        <div className="absolute -right-16 top-10 h-80 w-80 animate-aurora-shift rounded-full bg-accent/20 blur-[110px]" />
        <div className="grid-texture absolute inset-0 opacity-60" />
      </div>

      <div className="container flex flex-col items-center gap-6 text-center">
        <Badge variant="outline" className="gap-1.5 px-3 py-1">
          <Sparkles className="h-3 w-3 text-primary" />
          图标数据源自 LobeHub Icons · 同步于 {syncedDate}
        </Badge>

        <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight md:text-5xl">
          发现好用的 <span className="gradient-text">AI 工具</span>
          <br className="hidden sm:block" />
          一个入口直达全部官网
        </h1>

        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          收录全球主流 AI 模型、应用与云服务平台，按场景分类整理，支持关键词即时检索与社区共建，
          帮你从工具海洋里快速找到真正好用的那一个。
        </p>

        <dl className="mt-2 flex flex-wrap items-center justify-center gap-8">
          {[
            { label: '收录工具', value: stats.total },
            { label: '人工维护', value: stats.curated },
            { label: '分类', value: stats.categories },
            { label: '标签', value: stats.tags },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center">
              <dt className="order-2 text-xs text-muted-foreground">{item.label}</dt>
              <dd className="order-1 font-mono text-2xl font-semibold text-foreground">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
