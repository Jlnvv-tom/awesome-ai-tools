import { describe, expect, it } from 'vitest';

import { ICON_META } from '@/data/icons.generated';
import { ADDED_AT_MAP, CATEGORIES } from '@/data/registry';
import {
  getAllSites,
  getFeaturedSites,
  getRecentSites,
  getRelatedSites,
  getSiteById,
  getSitesByCategory,
  getStats,
  isWithinDays,
  resolveCategory,
  slugify,
} from '@/lib/sites';
import type { IconMeta } from '@/types/site';

function meta(overrides: Partial<IconMeta>): IconMeta {
  return {
    id: 'OpenAI',
    title: 'openai',
    fullTitle: 'OpenAI',
    color: '#000000',
    group: 'provider',
    url: 'https://openai.com',
    docsUrl: 'openai',
    param: {
      hasAvatar: true,
      hasBrand: false,
      hasBrandColor: false,
      hasColor: true,
      hasCombine: true,
      hasText: true,
      hasTextCn: false,
      hasTextColor: false,
    },
    ...overrides,
  };
}

describe('slugify', () => {
  it('把 PascalCase 转为小写 slug', () => {
    expect(slugify('OpenAI')).toBe('openai');
    expect(slugify('AdobeFirefly')).toBe('adobefirefly');
  });
});

describe('resolveCategory', () => {
  it('关键词命中时长关键词优先', () => {
    const target = meta({ fullTitle: 'Claude Code', url: 'https://code.claude.com' });
    expect(resolveCategory(target, CATEGORIES)).toBe('code');
  });

  it('未命中关键词时按 group 兜底', () => {
    expect(resolveCategory(meta({ id: 'Xx', fullTitle: 'Xx', group: 'model' }), CATEGORIES)).toBe(
      'model',
    );
    expect(
      resolveCategory(
        meta({
          id: 'Zz',
          title: 'zz',
          fullTitle: 'Zz',
          group: 'application',
          url: 'https://zz.dev',
        }),
        CATEGORIES,
      ),
    ).toBe('agent');
  });
});

describe('getAllSites', () => {
  it('覆盖全部图标元数据', () => {
    expect(getAllSites().length).toBe(ICON_META.length);
  });

  it('人工覆盖优先于派生结果', () => {
    const openai = getSiteById('openai');
    expect(openai).toBeDefined();
    expect(openai?.curated).toBe(true);
    expect(openai?.category).toBe('chat');
    expect(openai?.nameCn).toBe('OpenAI ChatGPT');
  });

  it('id 全局唯一', () => {
    const ids = getAllSites().map((site) => site.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('每个条目的分类都已登记', () => {
    const slugs = new Set(CATEGORIES.map((category) => category.slug));
    for (const site of getAllSites()) {
      expect(slugs.has(site.category)).toBe(true);
    }
  });
});

describe('收录时间', () => {
  it('每个条目都带合法的收录日期', () => {
    for (const site of getAllSites()) {
      expect(site.addedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('未显式覆盖时取 git 回填映射', () => {
    const site = getSiteById('openai');
    if (!site) throw new Error('缺少 openai 条目');
    expect(site.addedAt).toBe(ADDED_AT_MAP[site.iconId]);
  });

  it('isWithinDays 以运行时间为基准判断', () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(isWithinDays(today, 7)).toBe(true);
    expect(isWithinDays('2000-01-01', 7)).toBe(false);
  });

  it('最近收录按日期倒序且受 limit 约束', () => {
    const recent = getRecentSites({ days: 3650, limit: 5 });
    expect(recent.length).toBeLessThanOrEqual(5);
    const days = recent.map((site) => site.addedAt);
    expect([...days].sort().reverse()).toEqual(days);
  });

  it('时间窗口内无新增时降级为最近收录，不返回空', () => {
    expect(getRecentSites({ days: 1, limit: 4 }).length).toBeGreaterThan(0);
  });
});

describe('查询能力', () => {
  it('按分类返回条目且精选非空', () => {
    expect(getSitesByCategory('chat').length).toBeGreaterThan(0);
    expect(getFeaturedSites().length).toBeGreaterThan(0);
  });

  it('相关推荐不包含自身且同分类优先', () => {
    const site = getSiteById('openai');
    if (!site) throw new Error('缺少 openai 条目');
    const related = getRelatedSites(site, 5);
    expect(related.every((item) => item.id !== site.id)).toBe(true);
    expect(related.length).toBeGreaterThan(0);
  });

  it('统计信息与实际数据一致', () => {
    const stats = getStats();
    expect(stats.total).toBe(ICON_META.length);
    expect(stats.curated).toBeGreaterThan(0);
    expect(stats.categories).toBe(CATEGORIES.length);
  });
});
