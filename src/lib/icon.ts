import type { IconMeta } from '@/types/site';

/**
 * 图标 URL 构造与降级策略（见 docs/adr/0001）。
 *
 * 优先 unpkg（全球 CDN），失败后由组件依次降级到 GitHub raw，最后降级为品牌色占位块。
 */

const UNPKG_BASE = 'https://unpkg.com/@lobehub/icons-static-svg@latest/icons';
const GITHUB_BASE =
  'https://raw.githubusercontent.com/lobehub/lobe-icons/refs/heads/master/packages/static-svg/icons';

export type IconVariant = 'color' | 'mono' | 'brand' | 'text';

/** 图标 id → CDN 文件名 slug（与上游静态资源保持一致的小写 id） */
export function iconSlug(iconId: string): string {
  return iconId.toLowerCase();
}

function variantSuffix(variant: IconVariant): string {
  switch (variant) {
    case 'color':
      return '-color';
    case 'brand':
      return '-brand';
    case 'text':
      return '-text';
    default:
      return '';
  }
}

/** 生成单个 CDN 地址 */
export function getIconUrl(
  iconId: string,
  options: { variant?: IconVariant; base?: 'unpkg' | 'github' } = {},
): string {
  const { variant = 'color', base = 'unpkg' } = options;
  const root = base === 'github' ? GITHUB_BASE : UNPKG_BASE;
  return `${root}/${iconSlug(iconId)}${variantSuffix(variant)}.svg`;
}

/**
 * 返回按优先级排列的候选地址列表：
 * color → mono →（换 CDN 后重复一轮）。
 * 组件在 `onError` 时依次尝试下一个候选。
 */
export function getIconCandidates(meta: Pick<IconMeta, 'id' | 'param'>): string[] {
  const variants: IconVariant[] = [];
  if (meta.param.hasColor) variants.push('color');
  variants.push('mono');

  return [
    ...variants.map((variant) => getIconUrl(meta.id, { variant, base: 'unpkg' })),
    ...variants.map((variant) => getIconUrl(meta.id, { variant, base: 'github' })),
  ];
}

/** 品牌色首字母占位图（data URI，零网络依赖，作为最后兜底） */
export function getIconFallback(name: string, color: string): string {
  const initial = (name.trim()[0] ?? '?').toUpperCase();
  const safeColor = /^#[0-9a-f]{6}$/i.test(color) ? color : '#6e56f8';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="${safeColor}"/><text x="32" y="42" font-family="system-ui, -apple-system, PingFang SC, sans-serif" font-size="32" font-weight="700" text-anchor="middle" fill="#ffffff">${initial}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** lobehub.com/icons 上的图标详情页 */
export function getIconDocsUrl(meta: Pick<IconMeta, 'docsUrl'>): string {
  return `https://lobehub.com/icons/${meta.docsUrl}`;
}
