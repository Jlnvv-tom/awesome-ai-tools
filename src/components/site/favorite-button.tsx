'use client';

import { Heart } from 'lucide-react';

import { useFavorites } from '@/components/personalization-provider';
import { cn } from '@/lib/cn';

export interface FavoriteButtonProps {
  siteId: string;
  siteName: string;
  className?: string;
}

/**
 * 收藏按钮。
 *
 * 位于卡片 stretched-link 覆盖层之上（z-20），点击时阻止冒泡与默认行为，
 * 避免触发卡片跳转；`ready` 为假时保持未收藏态，防止 SSR 首屏闪烁。
 */
export function FavoriteButton({ siteId, siteName, className }: FavoriteButtonProps) {
  const { has, toggle, ready } = useFavorites();
  const active = ready && has(siteId);

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggle(siteId);
      }}
      aria-pressed={active}
      aria-label={active ? `取消收藏 ${siteName}` : `收藏 ${siteName}`}
      title={active ? '取消收藏' : '收藏'}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-background/80 backdrop-blur transition-all duration-200',
        'hover:scale-110 hover:border-primary/50 hover:text-primary',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        active ? 'border-primary/50 text-primary shadow-glow' : 'text-muted-foreground',
        className,
      )}
    >
      <Heart
        className={cn('h-3.5 w-3.5 transition-transform', active && 'scale-110 fill-current')}
      />
    </button>
  );
}
