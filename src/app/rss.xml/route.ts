import { SITE_DESCRIPTION, SITE_NAME, getSiteUrl } from '@/lib/seo';
import { getAllSites, getSiteDisplayName } from '@/lib/sites';

/**
 * RSS 2.0 订阅源：按收录时间倒序输出最近新增的工具。
 *
 * 无查询参数，构建期静态化（`force-static`），产物为静态资源，
 * 主站与 Cloudflare Pages 镜像均可直接托管。
 */
export const dynamic = 'force-static';

const FEED_SIZE = 20;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function GET() {
  const base = getSiteUrl();
  const self = `${base}/rss.xml`;

  const sites = [...getAllSites()]
    .sort((a, b) => b.addedAt.localeCompare(a.addedAt) || a.order - b.order)
    .slice(0, FEED_SIZE);

  const items = sites
    .map((site) => {
      const link = `${base}/site/${site.id}`;
      const title = getSiteDisplayName(site, 'zh');
      const pubDate = new Date(`${site.addedAt}T00:00:00Z`).toUTCString();

      return [
        '    <item>',
        `      <title>${escapeXml(title)}</title>`,
        `      <link>${escapeXml(link)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
        `      <description>${escapeXml(site.description)}</description>`,
        `      <category>${escapeXml(site.category)}</category>`,
        `      <pubDate>${pubDate}</pubDate>`,
        '    </item>',
      ].join('\n');
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${escapeXml(base)}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(self)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
