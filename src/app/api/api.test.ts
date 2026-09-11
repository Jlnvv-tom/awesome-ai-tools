import { describe, expect, it } from 'vitest';

import { GET as getCategories } from '@/app/api/categories/route';
import { GET as getSites } from '@/app/api/sites/route';
import { CATEGORIES } from '@/data/registry';

function request(path: string): Request {
  return new Request(`https://example.com${path}`);
}

describe('/api/sites', () => {
  it('默认返回分页结构', async () => {
    const response = getSites(request('/api/sites'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.limit).toBe(50);
    expect(body.offset).toBe(0);
    expect(body.items.length).toBeLessThanOrEqual(50);
    expect(body.total).toBeGreaterThan(0);
    expect(body.items[0]).toHaveProperty('addedAt');
    expect(body.items[0]).toHaveProperty('openSource');
  });

  it('按分类筛选', async () => {
    const response = getSites(request('/api/sites?category=chat&limit=200'));
    const body = await response.json();

    expect(body.items.every((item: { category: string }) => item.category === 'chat')).toBe(true);
    expect(body.total).toBe(body.items.length);
  });

  it('未知分类返回 400 结构化错误', async () => {
    const response = getSites(request('/api/sites?category=not-exist'));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('invalid_category');
  });

  it('limit 非法时降级为默认值并给出 warning', async () => {
    const response = getSites(request('/api/sites?limit=abc'));
    const body = await response.json();

    expect(body.limit).toBe(50);
    expect(body.warnings.length).toBeGreaterThan(0);
  });

  it('limit 超上限时收敛', async () => {
    const response = getSites(request('/api/sites?limit=9999'));
    const body = await response.json();

    expect(body.limit).toBe(200);
    expect(body.warnings[0]).toContain('收敛');
  });

  it('支持关键词与精选筛选', async () => {
    const response = getSites(request('/api/sites?q=openai&featured=true&limit=200'));
    const body = await response.json();

    expect(body.items.every((item: { featured: boolean }) => item.featured)).toBe(true);
  });

  it('提供 CORS 与缓存头', () => {
    const response = getSites(request('/api/sites'));

    expect(response.headers.get('access-control-allow-origin')).toBe('*');
    expect(response.headers.get('cache-control')).toContain('s-maxage=3600');
  });
});

describe('/api/categories', () => {
  it('返回全部分类与条目数', async () => {
    const response = getCategories(request('/api/categories'));
    const body = await response.json();

    expect(body.total).toBe(CATEGORIES.length);
    expect(body.items[0]).toHaveProperty('count');
  });

  it('按 slug 查询单个分类', async () => {
    const response = getCategories(request('/api/categories?slug=chat'));
    const body = await response.json();

    expect(body.total).toBe(1);
    expect(body.items[0].slug).toBe('chat');
  });

  it('未知 slug 返回 404', async () => {
    const response = getCategories(request('/api/categories?slug=not-exist'));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error.code).toBe('not_found');
  });
});
