import { Star } from 'lucide-react';

import { cn } from '@/lib/cn';
import { formatStars } from '@/lib/sorting';

export interface SiteStarBadgeProps {
  /** GitHub Star 数；缺省或为 0 时不渲染 */
  stars?: number;
  /** 无障碍文案（由字典传入，避免在此硬编码语言） */
  label?: string;
  className?: string;
}

/**
 * GitHub Star 徽标。
 *
 * 只展示可公开验证的客观数据，数据来自 `pnpm sync:metrics` 同步的生成文件；
 * 无数据时完全不渲染，不显示占位（见 docs/adr/0009）。
 */
export function SiteStarBadge({ stars, label, className }: SiteStarBadgeProps) {
  if (typeof stars !== 'number' || stars <= 0) return null;

  return (
    <span
      className={cn('inline-flex items-center gap-1 text-[10px] text-muted-foreground', className)}
      title={label}
      aria-label={label}
    >
      <Star className="h-3 w-3" aria-hidden="true" />
      <span className="font-mono tabular-nums">{formatStars(stars)}</span>
    </span>
  );
}
