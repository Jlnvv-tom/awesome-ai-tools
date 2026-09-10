'use client';

import { useCallback } from 'react';

import { STORAGE_KEYS } from './storage';
import { useStoredState } from './use-stored-state';

export interface FavoritesValue {
  /** 收藏的站点 id 列表 */
  ids: string[];
  count: number;
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  clear: () => void;
  /** 本地数据是否已就绪（SSR 首屏为 false） */
  ready: boolean;
}

/**
 * 收藏夹状态源。由 `PersonalizationProvider` 持有并通过 Context 下发，
 * 保证顶栏徽标、卡片按钮、收藏页与搜索筛选共享同一份状态。
 */
export function useFavoritesState(enabled = true): FavoritesValue {
  const { value, update, ready } = useStoredState<string[]>(STORAGE_KEYS.favorites, [], enabled);

  const has = useCallback((id: string) => value.includes(id), [value]);

  const toggle = useCallback(
    (id: string) => {
      update((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
    },
    [update],
  );

  const clear = useCallback(() => update([]), [update]);

  return { ids: value, count: value.length, has, toggle, clear, ready };
}
