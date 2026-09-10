import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  PersonalizationProvider,
  useFavorites,
  useUsageStats,
} from '@/components/personalization-provider';
import { readJson, removeKey, STORAGE_KEYS, writeJson } from '@/lib/storage';
import { useViewMode } from '@/lib/view-mode';

/** 收藏与统计必须由同一 Provider 下发，测试中同样需要包裹 */
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PersonalizationProvider>{children}</PersonalizationProvider>
);

beforeEach(() => {
  window.localStorage.clear();
});

describe('storage 基础读写', () => {
  it('写入后可原样读回', () => {
    writeJson('demo', { a: 1 });
    expect(readJson('demo', null)).toEqual({ a: 1 });
  });

  it('缺失时返回兜底值', () => {
    expect(readJson('missing', ['fallback'])).toEqual(['fallback']);
  });

  it('内容非法时回退到兜底值而不是抛错', () => {
    window.localStorage.setItem('ait:v1:broken', '{not-json');
    expect(readJson('broken', 'safe')).toBe('safe');
  });

  it('删除后回到缺失状态', () => {
    writeJson('temp', 1);
    removeKey('temp');
    expect(readJson('temp', 0)).toBe(0);
  });
});

describe('useFavorites', () => {
  it('切换收藏并持久化', () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });

    act(() => result.current.toggle('openai'));
    expect(result.current.has('openai')).toBe(true);
    expect(result.current.count).toBe(1);
    expect(readJson<string[]>(STORAGE_KEYS.favorites, [])).toEqual(['openai']);

    act(() => result.current.toggle('openai'));
    expect(result.current.has('openai')).toBe(false);
    expect(result.current.count).toBe(0);
  });

  it('多个站点可同时收藏后清空', () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });

    act(() => {
      result.current.toggle('openai');
      result.current.toggle('midjourney');
    });
    expect(result.current.count).toBe(2);

    act(() => result.current.clear());
    expect(result.current.count).toBe(0);
  });

  it('挂载后恢复已有收藏', () => {
    writeJson(STORAGE_KEYS.favorites, ['notion']);

    const { result } = renderHook(() => useFavorites(), { wrapper });
    expect(result.current.ready).toBe(true);
    expect(result.current.has('notion')).toBe(true);
  });

  it('同一 Provider 下多个消费者共享状态', () => {
    const { result } = renderHook(() => ({ a: useFavorites(), b: useFavorites() }), { wrapper });

    act(() => result.current.a.toggle('cursor'));
    expect(result.current.b.has('cursor')).toBe(true);
  });
});

describe('useViewMode', () => {
  it('默认网格视图并可切换持久化', () => {
    const { result } = renderHook(() => useViewMode());
    expect(result.current.view).toBe('grid');

    act(() => result.current.setView('list'));
    expect(result.current.view).toBe('list');
    expect(readJson(STORAGE_KEYS.viewMode, 'grid')).toBe('list');
  });
});

describe('useUsageStats', () => {
  it('同一批次内连续记录能正确累加', () => {
    const { result } = renderHook(() => useUsageStats(), { wrapper });

    act(() => {
      result.current.recordVisit('cursor');
      result.current.recordVisit('cursor');
    });

    expect(result.current.stats.cursor).toEqual({ visits: 2, outbound: 0 });
  });

  it('外链权重高于访问，收藏权重最高', () => {
    const { result } = renderHook(() => ({ usage: useUsageStats(), favorites: useFavorites() }), {
      wrapper,
    });

    act(() => {
      result.current.usage.recordVisit('cursor');
      result.current.usage.recordVisit('cursor');
      result.current.usage.recordVisit('cursor');
    });
    act(() => result.current.usage.recordOutbound('midjourney'));
    // cursor = 3 分（3 次访问），midjourney = 2 分（1 次外链）
    expect(result.current.usage.top(5)).toEqual(['cursor', 'midjourney']);

    act(() => result.current.favorites.toggle('midjourney'));
    // midjourney = 2 + 3（收藏）= 5 分，跃居第一
    expect(result.current.usage.top(5)).toEqual(['midjourney', 'cursor']);
  });

  it('无统计时返回空数组', () => {
    const { result } = renderHook(() => useUsageStats(), { wrapper });
    expect(result.current.top()).toEqual([]);
  });
});
