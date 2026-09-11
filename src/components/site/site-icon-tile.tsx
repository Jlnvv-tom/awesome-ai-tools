'use client';

import { useMemo } from 'react';

import { useIconStyle } from '@/components/personalization-provider';
import { BrandIcon } from '@/components/site/brand-icon';
import { cn } from '@/lib/cn';
import { expectedRenderMode, iconTileClass, resolveIconPlan } from '@/lib/icon-plan';

/** 图标容器尺寸档位：列表行 / 卡片 / 详情页大图 */
export type IconTileSize = 'sm' | 'md' | 'lg';

const SIZE_PRESET: Record<IconTileSize, { tile: string; icon: number; glow: string }> = {
  sm: { tile: 'h-10 w-10 rounded-xl', icon: 22, glow: '0 8px 24px -12px' },
  md: { tile: 'h-11 w-11 rounded-xl', icon: 26, glow: '0 8px 24px -12px' },
  lg: { tile: 'h-20 w-20 rounded-2xl', icon: 48, glow: '0 18px 48px -20px' },
};

export interface SiteIconTileProps {
  /** @lobehub/icons 的图标 id */
  iconId: string;
  /** 站点名，用于兜底占位图 */
  name: string;
  /** 品牌主色（同时决定辉光与垫板） */
  color: string;
  /** 是否存在彩色变体（服务端派生） */
  hasColor: boolean;
  size?: IconTileSize;
  /** 是否在所属 group 悬停时抬升（卡片与列表行为 true） */
  interactive?: boolean;
  className?: string;
}

/**
 * 图标容器：统一尺寸、圆角、品牌色辉光与「对比垫板」。
 *
 * 垫板按**计划中的首个渲染模式**而非当前模式计算：CDN 降级会改变实际渲染方式，
 * 若跟随它，容器底色会在加载过程中闪一下。
 *
 * 必须是客户端组件——垫板取决于用户的图标风格偏好（见 useIconStyle）。
 */
export function SiteIconTile({
  iconId,
  name,
  color,
  hasColor,
  size = 'md',
  interactive = true,
  className,
}: SiteIconTileProps) {
  const { style } = useIconStyle();
  const mode = useMemo(() => {
    const plan = resolveIconPlan({ iconId, name, color, style, hasColor });
    return expectedRenderMode(plan);
  }, [iconId, name, color, style, hasColor]);

  const preset = SIZE_PRESET[size];

  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center border border-white/10 transition-all duration-200',
        preset.tile,
        iconTileClass({ color, mode }),
        interactive && 'group-hover:scale-105',
        className,
      )}
      style={{ boxShadow: `${preset.glow} ${color}` }}
    >
      <BrandIcon iconId={iconId} name={name} color={color} hasColor={hasColor} size={preset.icon} />
    </span>
  );
}
