import { CATEGORIES } from '@/data/registry';
import type { Category, Site } from '@/types/site';

import { getAllSites } from './sites';

/**
 * 「待认领」判定：脚本（audit:curation）与贡献看板页面共用同一份规则，
 * 避免两处口径不一致。
 */

/** 自动派生简介的兜底文案前缀（见 lib/sites.ts deriveDescription） */
const FALLBACK_DESCRIPTION_PATTERN = /^LobeHub Icons 收录的/;

export function isUncurated(site: Site): boolean {
  return !site.curated || FALLBACK_DESCRIPTION_PATTERN.test(site.description);
}

export interface CurationGroup {
  category: Category;
  /** 该分类条目总数 */
  total: number;
  /** 待认领条目 */
  pending: Site[];
  /** 完成率（百分比，保留一位小数） */
  rate: number;
}

export interface CurationSummary {
  total: number;
  maintained: number;
  pending: Site[];
  rate: number;
  groups: CurationGroup[];
}

/** 汇总维护进度，按分类分组（仅包含有条目的分类） */
export function getCurationSummary(): CurationSummary {
  const sites = getAllSites();
  const pending = sites.filter(isUncurated);

  const groups = [...CATEGORIES]
    .sort((a, b) => a.order - b.order)
    .map((category) => {
      const total = sites.filter((site) => site.category === category.slug).length;
      const categoryPending = pending.filter((site) => site.category === category.slug);
      return {
        category,
        total,
        pending: categoryPending,
        rate: total === 0 ? 0 : Math.round(((total - categoryPending.length) / total) * 1000) / 10,
      };
    })
    .filter((group) => group.total > 0);

  return {
    total: sites.length,
    maintained: sites.length - pending.length,
    pending,
    rate:
      sites.length === 0
        ? 0
        : Math.round(((sites.length - pending.length) / sites.length) * 1000) / 10,
    groups,
  };
}
