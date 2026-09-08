'use client';

import { useState } from 'react';

import { getIconUrl, type IconVariant, getIconFallback } from '@/lib/icon';
import { cn } from '@/lib/cn';

export interface BrandIconProps {
  /** @lobehub/icons 的图标 id（PascalCase） */
  iconId: string;
  /** 站点名，用于兜底占位图的首字母 */
  name: string;
  /** 品牌主色 */
  color: string;
  /** 是否拥有 color 变体（来自 IconMeta.param.hasColor） */
  hasColor?: boolean;
  /** 像素尺寸 */
  size?: number;
  className?: string;
}

/**
 * 品牌图标：unpkg → GitHub raw → 品牌色首字母占位块，三级降级。
 * 显式声明尺寸，避免布局抖动（CLS）。
 */
export function BrandIcon({
  iconId,
  name,
  color,
  hasColor = true,
  size = 40,
  className,
}: BrandIconProps) {
  const variants: IconVariant[] = hasColor ? ['color', 'mono'] : ['mono'];
  const candidates = [
    ...variants.map((variant) => getIconUrl(iconId, { variant, base: 'unpkg' })),
    ...variants.map((variant) => getIconUrl(iconId, { variant, base: 'github' })),
  ];
  const [index, setIndex] = useState(0);
  const failed = index >= candidates.length;
  const src = failed ? getIconFallback(name, color) : candidates[index];

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      onError={() => setIndex((value) => value + 1)}
      className={cn('shrink-0 object-contain', className)}
      style={{ width: size, height: size }}
    />
  );
}
