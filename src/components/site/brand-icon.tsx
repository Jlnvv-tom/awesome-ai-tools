'use client';

import { useMemo, useState } from 'react';

import { useIconStyle } from '@/components/personalization-provider';
import { cn } from '@/lib/cn';
import { resolveIconPlan } from '@/lib/icon-plan';

export interface BrandIconProps {
  /** @lobehub/icons 的图标 id（PascalCase） */
  iconId: string;
  /** 站点名，用于兜底占位图的首字母 */
  name: string;
  /** 品牌主色 */
  color: string;
  /** 是否拥有 color 变体（服务端派生自 IconMeta.param.hasColor；为 false 时不请求必定 404 的 color 变体） */
  hasColor: boolean;
  /** 像素尺寸 */
  size?: number;
  className?: string;
}

/**
 * 品牌图标。
 *
 * 两种渲染方式，由 `resolveIconPlan` 决定：
 * - **img**：彩色图标保持品牌原色（unpkg → GitHub raw → 品牌色首字母块三级降级）；
 * - **mask + currentColor**：单色图标以此为底色着色，浅色模式呈近黑、深色模式呈近白，
 *   效果与 lobehub 官网内联 SVG 一致（上游 `{slug}.svg` 本身就用 `fill="currentColor"`，
 *   但 `<img>` 引用的 SVG 是独立文档，继承不到页面颜色，只会回退成黑色）。
 *
 * mask 元素自身收不到 load/error 事件，因此同层挂载一个隐藏 `<img>` 做可达性探测；
 * 它与 mask 使用同一个 URL，命中浏览器缓存，不产生额外请求。
 */
export function BrandIcon({ iconId, name, color, hasColor, size = 40, className }: BrandIconProps) {
  const { style } = useIconStyle();
  const plan = useMemo(
    () => resolveIconPlan({ iconId, name, color, style, hasColor }),
    [iconId, name, color, style, hasColor],
  );

  const [index, setIndex] = useState(0);
  // 风格切换后候选数量会变（4 → 2），钳位到最后一个候选而不是直接落到兜底图
  const current = plan.sources[Math.min(index, plan.sources.length - 1)];

  const shell = cn('shrink-0', className);
  const box = { width: size, height: size };

  if (!current) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={plan.fallbackUrl}
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        className={cn('object-contain', shell)}
        style={box}
      />
    );
  }

  if (current.mode === 'img') {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={current.url}
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        onError={() => setIndex((value) => value + 1)}
        className={cn('object-contain', shell)}
        style={box}
      />
    );
  }

  const maskImage = `url("${current.url}")`;

  return (
    <span
      className={cn('relative inline-block text-foreground', shell)}
      style={box}
      aria-hidden="true"
    >
      <span
        className="absolute inset-0 transition-colors duration-200"
        style={{
          backgroundColor: 'currentColor',
          maskImage,
          WebkitMaskImage: maskImage,
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
          maskPosition: 'center',
          WebkitMaskPosition: 'center',
        }}
      />
      {/* 探测层：mask 加载失败不触发任何事件，靠它推进降级链；URL 相同走缓存，零额外请求 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={current.url}
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        onError={() => setIndex((value) => value + 1)}
        className="absolute inset-0 h-full w-full opacity-0"
      />
    </span>
  );
}
