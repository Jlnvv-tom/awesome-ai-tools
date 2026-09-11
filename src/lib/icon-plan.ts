import { colorTone } from '@/lib/color';
import { getIconFallback, getIconUrl } from '@/lib/icon';
import type { IconStyle } from '@/lib/icon-style';

/**
 * 图标渲染决策（纯函数）。
 *
 * 为什么需要这一层：`<img>` 引用的 SVG 是独立文档，`fill="currentColor"` 继承不到页面色，
 * 只会回退成黑色 —— 这正是深色模式下 105 个单色图标「黑贴黑」看不见的根因。
 * 因此单色图标改为 **mask + currentColor** 渲染（与 lobehub 官网内联 SVG 的效果一致），
 * 彩色图标仍用 `<img>` 保留品牌原色。
 */

/** 实际渲染方式：`img` 原色 / `mask` 跟随主题 / `fallback` 品牌色首字母块 */
export type IconRenderMode = 'img' | 'mask' | 'fallback';

export interface IconSource {
  url: string;
  mode: 'img' | 'mask';
}

export interface IconPlanInput {
  /** @lobehub/icons 的图标 id（PascalCase） */
  iconId: string;
  /** 站点名，用于兜底占位图的首字母 */
  name: string;
  /** 品牌主色 */
  color: string;
  /** 用户选择的图标风格 */
  style: IconStyle;
  /** 该图标是否存在彩色变体（服务端派生，禁止在客户端查表获得） */
  hasColor: boolean;
}

export interface IconPlan {
  /** 按优先级排列的候选；组件在加载失败时依次后移 */
  sources: IconSource[];
  /** 全部候选失败后的兜底图（品牌色首字母块，data URI） */
  fallbackUrl: string;
}

const BASES = ['unpkg', 'github'] as const;

/**
 * 按「用户风格 × 变体可用性」给出候选序列：
 *
 * | 风格 | hasColor | 候选 |
 * |---|---|---|
 * | 彩色 | true | unpkg/color → github/color（img）→ unpkg/mono → github/mono（mask）|
 * | 彩色 | false | unpkg/mono → github/mono（mask）|
 * | 单色 | 任意 | unpkg/mono → github/mono（mask）|
 */
export function resolveIconPlan({ iconId, name, color, style, hasColor }: IconPlanInput): IconPlan {
  const sources: IconSource[] = [];

  if (style === 'color' && hasColor) {
    for (const base of BASES) {
      sources.push({ url: getIconUrl(iconId, { variant: 'color', base }), mode: 'img' });
    }
  }

  for (const base of BASES) {
    sources.push({ url: getIconUrl(iconId, { variant: 'mono', base }), mode: 'mask' });
  }

  return { sources, fallbackUrl: getIconFallback(name, color) };
}

/**
 * 图标容器的垫板类名。
 *
 * 只有「以 `<img>` 渲染品牌原色」的场景才需要垫板：这类颜色不受主题控制，
 * 浅色模式遇到白色图标、深色模式遇到黑色图标都会融进背景。
 * mask 渲染的颜色由 `--foreground` 驱动，天然与主题相反，无需垫板。
 */
export function iconTileClass({ color, mode }: { color: string; mode: IconRenderMode }): string {
  if (mode !== 'img') return 'bg-muted/40';

  switch (colorTone(color)) {
    case 'light':
      // 浅色模式给深色垫板让白图标显形；深色模式下背景本身够深，恢复常规
      return 'bg-foreground/85 dark:bg-muted/40';
    case 'dark':
      // 深色模式下黑图标需要浅色垫板
      return 'bg-muted/40 dark:bg-primary-foreground/90';
    default:
      return 'bg-muted/40';
  }
}

/**
 * 预期的首个渲染模式。
 *
 * 垫板必须按「计划的模式」而非「当前实际模式」决定：CDN 失败降级会改变实际模式，
 * 若跟随它计算，垫板会在加载过程中闪一下。
 */
export function expectedRenderMode(plan: IconPlan): IconRenderMode {
  return plan.sources[0]?.mode ?? 'fallback';
}
