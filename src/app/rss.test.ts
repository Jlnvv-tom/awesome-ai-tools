import { describe, expect, it } from 'vitest';

import { GET } from '@/app/rss.xml/route';

describe('/rss.xml', () => {
  it('返回 XML 内容类型与 RSS 2.0 结构', async () => {
    const response = GET();

    expect(response.headers.get('content-type')).toContain('application/xml');
    const xml = await response.text();

    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<rss version="2.0"');
    expect(xml).toContain('<channel>');
    expect(xml).toContain('<language>zh-CN</language>');
    expect(xml).toContain('atom:link');
  });

  it('条目数量不超过 20 且包含必要字段', async () => {
    const xml = await GET().text();
    const items = xml.match(/<item>/g) ?? [];

    expect(items.length).toBeGreaterThan(0);
    expect(items.length).toBeLessThanOrEqual(20);
    expect(xml).toContain('<guid isPermaLink="true">');
    expect(xml).toContain('<pubDate>');
  });

  it('转义 XML 特殊字符', async () => {
    const xml = await GET().text();

    // 描述中若出现 & 必须转义，避免产生非法 XML
    expect(xml).not.toMatch(/<description>[^<]*&(?!amp;|lt;|gt;|quot;|apos;)/);
  });
});
