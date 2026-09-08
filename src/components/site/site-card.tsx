import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

import { BrandIcon } from '@/components/site/brand-icon';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';
import type { Site } from '@/types/site';

export interface SiteCardProps {
  site: Site;
  /** 是否显示标签（首页网格可关闭以节省空间） */
  showTags?: boolean;
}

export function SiteCard({ site, showTags = true }: SiteCardProps) {
  return (
    <Link
      href={`/site/${site.id}`}
      className={cn(
        'glass-card group relative flex h-full flex-col gap-3 p-4 transition-all duration-200 ease-out',
        'hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      )}
      aria-label={`${site.nameCn ?? site.name} 官网直达`}
    >
      <div className="flex items-start gap-3">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-muted/40 transition-transform duration-200 group-hover:scale-105"
          style={{ boxShadow: `0 8px 24px -12px ${site.color}` }}
        >
          <BrandIcon iconId={site.iconId} name={site.name} color={site.color} size={26} />
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight">{site.nameCn ?? site.name}</p>
          <p className="truncate text-xs text-muted-foreground">{site.name}</p>
        </div>

        <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
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
    </Link>
  );
}
