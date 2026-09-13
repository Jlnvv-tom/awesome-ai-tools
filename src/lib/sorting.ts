/**
 * 站点排序（M5）
 *
 * 只使用客观口径：默认权重、收录时间、GitHub Star、名称。
 * 不引入任何评价性排序或流量估计，保持收录中立（见 docs/adr/0009）。
 */
import type { Site } from '@/types/site';

export type SortKey = 'default' | 'newest' | 'stars' | 'name';

export const SORT_KEYS: SortKey[] = ['default', 'newest', 'stars', 'name'];

/** 默认口径：人工权重优先，权重相同按名称 */
function compareDefault(a: Site, b: Site): number {
  if (a.order !== b.order) return a.order - b.order;
  return a.name.localeCompare(b.name);
}

/** 按指定口径排序，返回新数组（不修改入参） */
export function sortSites(sites: Site[], key: SortKey = 'default'): Site[] {
  const sorted = [...sites];

  switch (key) {
    case 'newest':
      return sorted.sort((a, b) =>
        a.addedAt === b.addedAt ? compareDefault(a, b) : a.addedAt < b.addedAt ? 1 : -1,
      );
    case 'stars':
      // 没有 Star 数据的条目排在最后，同 Star 时回落到默认权重
      return sorted.sort((a, b) => {
        const left = a.stars ?? -1;
        const right = b.stars ?? -1;
        if (left !== right) return right - left;
        return compareDefault(a, b);
      });
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted.sort(compareDefault);
  }
}

/** Star 数展示：1000 以上用 k 缩写，保留一位小数（去尾零） */
export function formatStars(stars: number): string {
  if (!Number.isFinite(stars) || stars < 0) return '0';
  if (stars < 1000) return String(Math.round(stars));

  const thousands = stars / 1000;
  if (thousands >= 10) return `${Math.round(thousands)}k`;
  return `${thousands.toFixed(1).replace(/\.0$/, '')}k`;
}
