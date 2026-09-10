import { CircleDollarSign, GitFork, Languages } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';
import type { PricingState, Site, TriState } from '@/types/site';

const PRICING: Record<PricingState, { label: string; className: string }> = {
  free: { label: '免费', className: 'border-emerald-500/40 text-emerald-400' },
  freemium: { label: '免费增值', className: 'border-sky-500/40 text-sky-400' },
  paid: { label: '付费', className: 'border-amber-500/40 text-amber-400' },
  unknown: { label: '定价待补充', className: 'text-muted-foreground' },
};

const OPEN_SOURCE: Record<TriState, { label: string; className: string }> = {
  yes: { label: '开源', className: 'border-primary/40 text-primary' },
  no: { label: '闭源', className: 'text-muted-foreground' },
  unknown: { label: '开源待补充', className: 'text-muted-foreground' },
};

const CHINESE: Record<TriState, { label: string; className: string }> = {
  yes: { label: '支持中文', className: 'border-accent/40 text-accent' },
  no: { label: '暂不支持中文', className: 'text-muted-foreground' },
  unknown: { label: '中文待补充', className: 'text-muted-foreground' },
};

/** 详情页元信息徽标组：定价 / 是否开源 / 是否支持中文，未填写时显示「待补充」 */
export function SiteMetaBadges({ site, className }: { site: Site; className?: string }) {
  const pricing = PRICING[site.pricing];
  const openSource = OPEN_SOURCE[site.openSource];
  const chinese = CHINESE[site.chineseSupport];

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <Badge variant="outline" className={cn('gap-1', pricing.className)}>
        <CircleDollarSign className="h-3 w-3" aria-hidden="true" />
        {pricing.label}
      </Badge>
      <Badge variant="outline" className={cn('gap-1', openSource.className)}>
        <GitFork className="h-3 w-3" aria-hidden="true" />
        {openSource.label}
      </Badge>
      <Badge variant="outline" className={cn('gap-1', chinese.className)}>
        <Languages className="h-3 w-3" aria-hidden="true" />
        {chinese.label}
      </Badge>
    </div>
  );
}
