'use client';

import { useCallback } from 'react';

import { STORAGE_KEYS } from './storage';
import { useStoredState } from './use-stored-state';

/** 图标风格：`color` 用品牌原色，`mono` 统一为跟随主题的线条色 */
export type IconStyle = 'color' | 'mono';

export interface IconStyleValue {
  /** 当前风格，SSR 首屏为默认值 `color` */
  style: IconStyle;
  setStyle: (next: IconStyle) => void;
  /** 在两种风格间切换，供顶栏按钮直接调用 */
  toggle: () => void;
  /** 本地偏好是否已就绪（SSR 首屏为 false） */
  ready: boolean;
}

/**
 * 图标风格偏好源。与收藏夹、使用统计一样由 `PersonalizationProvider` 持有并下发，
 * 避免 300 多个卡片各自读取 localStorage 并建立订阅。
 */
export function useIconStyleState(enabled = true): IconStyleValue {
  const { value, update, ready } = useStoredState<IconStyle>(
    STORAGE_KEYS.iconStyle,
    'color',
    enabled,
  );

  const setStyle = useCallback((next: IconStyle) => update(next), [update]);

  const toggle = useCallback(
    () => update((prev) => (prev === 'color' ? 'mono' : 'color')),
    [update],
  );

  return { style: value, setStyle, toggle, ready };
}
