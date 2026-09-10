'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { readJson, subscribe, writeJson } from './storage';

export type Updater<T> = T | ((prev: T) => T);

/**
 * 与 localStorage 双向同步的状态。
 *
 * - 首屏使用服务端可确定的 `initial`，挂载后再读取本地值并把 `ready` 置真，
 *   避免 SSG 期间的 hydration 不匹配与依赖本地数据区块的闪烁；
 * - `update` 支持函数式更新，保证同一批次内连续调用也能正确累加；
 * - 监听 `storage` 事件实现跨标签页同步。
 */
export function useStoredState<T>(key: string, initial: T, enabled = true) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  const initialRef = useRef(initial);

  useEffect(() => {
    // enabled 为 false 时由上层 Provider 统一持有状态，这里不读取也不订阅
    if (!enabled) return;
    setValue(readJson(key, initialRef.current));
    setReady(true);
    return subscribe(key, () => setValue(readJson(key, initialRef.current)));
  }, [key, enabled]);

  const update = useCallback(
    (next: Updater<T>) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? (next as (current: T) => T)(prev) : next;
        writeJson(key, resolved);
        return resolved;
      });
    },
    [key],
  );

  return { value, update, ready };
}
