'use client';

import { useCallback } from 'react';

import { STORAGE_KEYS } from './storage';
import { useStoredState } from './use-stored-state';

export type ViewMode = 'grid' | 'list';

/** 网格 / 列表视图偏好，跨页面与会话保持一致 */
export function useViewMode() {
  const { value, update, ready } = useStoredState<ViewMode>(STORAGE_KEYS.viewMode, 'grid');
  const setView = useCallback((next: ViewMode) => update(next), [update]);

  return { view: value, setView, ready };
}
