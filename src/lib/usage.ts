'use client';

import { useCallback } from 'react';

import { STORAGE_KEYS } from './storage';
import { useStoredState } from './use-stored-state';

export interface UsageEntry {
  /** 进入详情页次数 */
  visits: number;
  /** 点击官网直达次数 */
  outbound: number;
}

export interface UsageValue {
  stats: Record<string, UsageEntry>;
  recordVisit: (id: string) => void;
  recordOutbound: (id: string) => void;
  /** 按加权得分倒序返回站点 id */
  top: (limit?: number) => string[];
  ready: boolean;
}

/** 外链表示明确兴趣，收藏表示长期偏好，权重均高于普通浏览 */
const VISIT_SCORE = 1;
const OUTBOUND_SCORE = 2;
const FAVORITE_SCORE = 3;

/**
 * 本地使用统计状态源（仅存于浏览器，用于生成「我的常用」，不做任何跨用户统计）。
 *
 * `isFavorite` 由收藏夹 Provider 注入，避免与收藏状态产生双向依赖。
 */
export function useUsageStatsState(
  isFavorite: (id: string) => boolean,
  enabled = true,
): UsageValue {
  const { value, update, ready } = useStoredState<Record<string, UsageEntry>>(
    STORAGE_KEYS.usage,
    {},
    enabled,
  );

  const record = useCallback(
    (id: string, field: keyof UsageEntry) => {
      update((prev) => {
        const current = prev[id] ?? { visits: 0, outbound: 0 };
        return { ...prev, [id]: { ...current, [field]: current[field] + 1 } };
      });
    },
    [update],
  );

  const recordVisit = useCallback((id: string) => record(id, 'visits'), [record]);

  const recordOutbound = useCallback((id: string) => record(id, 'outbound'), [record]);

  const top = useCallback(
    (limit = 8) =>
      Object.entries(value)
        .map(([id, entry]) => ({
          id,
          score:
            entry.visits * VISIT_SCORE +
            entry.outbound * OUTBOUND_SCORE +
            (isFavorite(id) ? FAVORITE_SCORE : 0),
        }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
        .slice(0, limit)
        .map((item) => item.id),
    [value, isFavorite],
  );

  return { stats: value, recordVisit, recordOutbound, top, ready };
}
