import Link from 'next/link';

import { BrandIcon } from '@/components/site/brand-icon';
import { FavoriteButton } from '@/components/site/favorite-button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';
import type { Site } from '@/types/site';

export interface SiteCardProps {
  site: Site;
  /** 是否显示标签（首页网格可关闭以节省空间） */
  showTags?: boolean;
  /** 是否显示收藏按钮 */
  showFavorite?: boolean;
}

/**
 * 站点卡片。
 *
 * 结构为「容器 + 覆盖式主链接（stretched-link）」，收藏按钮以更高层级置于链接之上，
 * 避免交互元素嵌套（button 套在 a 内）带来的非法 DOM 与键盘/读屏问题。
 */
export function SiteCard({ site, showTags = true, showFavorite = true }: SiteCardProps) {
  const displayName = site.nameCn ?? site.name;

  return (
    <div
      className={cn(
        'glass-card group relative flex h-full flex-col gap-3 p-4 transition-all duration-200 ease-out',
        'hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow',
      )}
    >
      <Link
        href={`/site/${site.id}`}
        className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`查看 ${displayName} 详情`}
      />

      <div className="flex items-start gap-3 pr-8">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-muted/40 transition-transform duration-200 group-hover:scale-105"
          style={{ boxShadow: `0 8px 24px -12px ${site.color}` }}
        >
          <BrandIcon iconId={site.iconId} name={site.name} color={site.color} size={26} />
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight">{displayName}</p>
          <p className="truncate text-xs text-muted-foreground">{site.name}</p>
        </div>
      </div>

      <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
        {site.description}
      </p>

      {showTags && site.tags.length > 0 && (
        <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
          {site.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="muted" className="px-2 py-0 text-[10px]">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {showFavorite && (
        <div className="absolute right-3 top-3 z-20">
          <FavoriteButton siteId={site.id} siteName={displayName} />
        </div>
      )}
    </div>
  );
}
