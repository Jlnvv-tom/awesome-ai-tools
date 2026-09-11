import Link from 'next/link';

import { BrandIcon } from '@/components/site/brand-icon';
import { FavoriteButton } from '@/components/site/favorite-button';
import { Badge } from '@/components/ui/badge';
import { DEFAULT_LOCALE, localePath, type Locale } from '@/i18n/config';
import { cn } from '@/lib/cn';
import { getSiteDisplayName } from '@/lib/sites';
import type { Site } from '@/types/site';

/** 列表视图的行式布局：单行紧凑，图标 + 名称 + 简介 + 标签 + 收藏 */
export function SiteRow({ site, locale = DEFAULT_LOCALE }: { site: Site; locale?: Locale }) {
  const displayName = getSiteDisplayName(site, locale);

  return (
    <div
      className={cn(
        'glass-card group relative flex items-center gap-3 p-3 transition-all duration-200 ease-out',
        'hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow',
      )}
    >
      <Link
        href={localePath(locale, `/site/${site.id}`)}
        className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`${locale === 'en' ? 'View' : '查看'} ${displayName} ${locale === 'en' ? 'details' : '详情'}`}
      />

      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-muted/40 transition-transform duration-200 group-hover:scale-105"
        style={{ boxShadow: `0 8px 24px -12px ${site.color}` }}
      >
        <BrandIcon iconId={site.iconId} name={site.name} color={site.color} size={22} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold leading-tight">{displayName}</p>
        <p className="truncate text-xs text-muted-foreground">{site.description}</p>
      </div>

      <div className="hidden items-center gap-1.5 lg:flex">
        {site.tags.slice(0, 2).map((tag) => (
          <Badge key={tag} variant="muted" className="px-2 py-0 text-[10px]">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="relative z-20 shrink-0">
        <FavoriteButton siteId={site.id} siteName={displayName} locale={locale} />
      </div>
    </div>
  );
}
