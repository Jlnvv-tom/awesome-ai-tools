import { describe, expect, it } from 'vitest';

import { formatStars, sortSites } from '@/lib/sorting';
import type { Site } from '@/types/site';

function site(partial: Partial<Site> & { id: string }): Site {
  return {
    iconId: partial.id,
    iconSource: 'lobehub',
    name: partial.id,
    url: `https://${partial.id}.example.com`,
    category: 'chat',
    tags: [],
    description: '用于排序测试的条目描述文本，长度满足校验要求。',
    featured: false,
    order: 9999,
    color: '#6e56f8',
    hasColor: false,
    curated: true,
    addedAt: '2026-01-01',
    pricing: 'unknown',
    openSource: 'unknown',
    chineseSupport: 'unknown',
    ...partial,
  };
}

describe('sortSites', () => {
  const sites = [
    site({ id: 'beta', name: 'Beta', order: 2, addedAt: '2026-03-01', stars: 100 }),
    site({ id: 'alpha', name: 'Alpha', order: 1, addedAt: '2026-05-01', stars: 5000 }),
    site({ id: 'gamma', name: 'Gamma', order: 3, addedAt: '2026-01-01' }),
  ];

  it('默认按权重升序，权重相同时按名称', () => {
    expect(sortSites(sites, 'default').map((item) => item.id)).toEqual(['alpha', 'beta', 'gamma']);
  });

  it('最新优先按收录时间倒序', () => {
    expect(sortSites(sites, 'newest').map((item) => item.id)).toEqual(['alpha', 'beta', 'gamma']);
  });

  it('Star 口径按 Star 降序，缺数据的排在最后', () => {
    expect(sortSites(sites, 'stars').map((item) => item.id)).toEqual(['alpha', 'beta', 'gamma']);
  });

  it('名称口径按字母序', () => {
    expect(sortSites(sites, 'name').map((item) => item.id)).toEqual(['alpha', 'beta', 'gamma']);
  });

  it('不修改入参数组', () => {
    const input = [...sites];
    sortSites(input, 'name');
    expect(input.map((item) => item.id)).toEqual(['beta', 'alpha', 'gamma']);
  });

  it('相同 Star 时回落到默认权重', () => {
    const tied = [
      site({ id: 'b', name: 'B', order: 2, stars: 100 }),
      site({ id: 'a', name: 'A', order: 1, stars: 100 }),
    ];
    expect(sortSites(tied, 'stars').map((item) => item.id)).toEqual(['a', 'b']);
  });
});

describe('formatStars', () => {
  it('小于 1000 直接展示整数', () => {
    expect(formatStars(0)).toBe('0');
    expect(formatStars(999)).toBe('999');
  });

  it('千位用 k 缩写并去尾零', () => {
    expect(formatStars(1000)).toBe('1k');
    expect(formatStars(1500)).toBe('1.5k');
    expect(formatStars(12000)).toBe('12k');
  });

  it('非法输入兜底为 0', () => {
    expect(formatStars(Number.NaN)).toBe('0');
    expect(formatStars(-5)).toBe('0');
  });
});
