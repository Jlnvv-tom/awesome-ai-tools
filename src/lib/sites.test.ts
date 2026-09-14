import { describe, expect, it } from 'vitest';

import { ICON_META } from '@/data/icons.generated';
import { ADDED_AT_MAP, CATEGORIES } from '@/data/registry';
import {
  getAllSites,
  getCategoriesWithCount,
  getCategory,
  getCategoryScope,
  getChildCategories,
  getFeaturedSites,
  getRecentSites,
  getRelatedSites,
  getSiteById,
  getSitesByCategory,
  getStats,
  getTopCategories,
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
  it('覆盖全部图标元数据，并追加自主收录条目', () => {
    const sites = getAllSites();
    const fromIconLibrary = sites.filter((site) => site.iconSource === 'lobehub');
    expect(fromIconLibrary).toHaveLength(ICON_META.length);
    expect(sites.length).toBeGreaterThanOrEqual(ICON_META.length);
  });

  it('自主收录条目视为人工维护，且图标来源不是图标库', () => {
    const catalogSites = getAllSites().filter((site) => site.iconSource !== 'lobehub');
    expect(catalogSites.length).toBeGreaterThan(0);

    for (const site of catalogSites) {
      expect(site.curated).toBe(true);
      expect(['favicon', 'initial']).toContain(site.iconSource);
      // 自主收录条目的 iconId 必须与自身 id 或已登记的图标 id 一致
      expect(site.iconId.length).toBeGreaterThan(0);
    }
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
    // total 含自主收录条目，因此应等于站点全集而非仅图标库大小
    expect(stats.total).toBe(getAllSites().length);
    expect(stats.total).toBeGreaterThanOrEqual(ICON_META.length);
    expect(stats.curated).toBeGreaterThan(0);
    expect(stats.categories).toBe(CATEGORIES.length);
  });
});

describe('分类层级', () => {
  it('一级分类不填 parent', () => {
    for (const category of getTopCategories()) {
      expect(category.parent).toBeUndefined();
    }
  });

  it('二级分类的 parent 指向一个已存在的一级分类（仅两级）', () => {
    for (const category of CATEGORIES.filter((item) => item.parent)) {
      const parent = getCategory(category.parent as string);
      expect(parent).toBeDefined();
      expect(parent?.parent).toBeUndefined();
    }
  });

  it('父分类的作用域包含自身与全部子分类', () => {
    const scope = getCategoryScope('infra');
    expect(scope.has('infra')).toBe(true);
    for (const child of getChildCategories('infra')) {
      expect(scope.has(child.slug)).toBe(true);
    }
  });

  it('二级分类的作用域只含自身', () => {
    expect([...getCategoryScope('inference')]).toEqual(['inference']);
  });

  it('父分类页聚合子分类条目，且条目数多于其兜底条目', () => {
    const aggregated = getSitesByCategory('infra');
    const ownOnly = getAllSites().filter((site) => site.category === 'infra');
    const scope = getCategoryScope('infra');

    expect(aggregated.length).toBeGreaterThan(ownOnly.length);
    expect(aggregated.every((site) => scope.has(site.category))).toBe(true);
  });

  it('未登记的分类 slug 返回空数组', () => {
    expect(getSitesByCategory('not-a-category')).toEqual([]);
  });

  it('一级分类的 count 为聚合值（自身 + 子分类）', () => {
    const counts = getCategoriesWithCount();
    const infra = counts.find((item) => item.slug === 'infra');
    const sites = getAllSites();
    const childSlugs = getChildCategories('infra').map((child) => child.slug);

    const own = sites.filter((site) => site.category === 'infra').length;
    const children = sites.filter((site) => childSlugs.includes(site.category)).length;

    expect(infra?.count).toBe(own + children);
  });
});
