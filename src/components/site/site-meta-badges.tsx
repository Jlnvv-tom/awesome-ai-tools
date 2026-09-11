import { CircleDollarSign, GitFork, Languages } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { DEFAULT_LOCALE, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { cn } from '@/lib/cn';
import type { PricingState, Site, TriState } from '@/types/site';

const PRICING_CLASS: Record<PricingState, string> = {
  free: 'border-emerald-500/40 text-emerald-400',
  freemium: 'border-sky-500/40 text-sky-400',
  paid: 'border-amber-500/40 text-amber-400',
  unknown: 'text-muted-foreground',
};

const OPEN_SOURCE_CLASS: Record<TriState, string> = {
  yes: 'border-primary/40 text-primary',
  no: 'text-muted-foreground',
  unknown: 'text-muted-foreground',
};

const CHINESE_CLASS: Record<TriState, string> = {
  yes: 'border-accent/40 text-accent',
  no: 'text-muted-foreground',
  unknown: 'text-muted-foreground',
};

/** 详情页元信息徽标组：定价 / 是否开源 / 是否支持中文，未填写时显示「待补充」 */
export function SiteMetaBadges({
  site,
  className,
  locale = DEFAULT_LOCALE,
}: {
  site: Site;
  className?: string;
  locale?: Locale;
}) {
  const meta = getDictionary(locale).meta;
  const pricing = { label: meta.pricing[site.pricing], className: PRICING_CLASS[site.pricing] };
  const openSource = {
    label: meta.openSource[site.openSource],
    className: OPEN_SOURCE_CLASS[site.openSource],
  };
  const chinese = {
    label: meta.chinese[site.chineseSupport],
    className: CHINESE_CLASS[site.chineseSupport],
  };

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
