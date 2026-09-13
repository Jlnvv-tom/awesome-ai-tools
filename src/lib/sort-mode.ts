'use client';

import { useCallback } from 'react';

import type { SortKey } from './sorting';
import { STORAGE_KEYS } from './storage';
import { useStoredState } from './use-stored-state';

/** 排序口径偏好，与视图模式一样跨页面与会话保持一致 */
export function useSortMode() {
  const { value, update, ready } = useStoredState<SortKey>(STORAGE_KEYS.sortMode, 'default');

  const setSort = useCallback((next: SortKey) => update(next), [update]);

  return { sort: value, setSort, ready };
}
