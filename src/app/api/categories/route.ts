import { getCategoriesWithCount } from '@/lib/sites';

/**
 * 开放 API：分类列表（含条目数），可用 `slug` 查询单个分类。
 *
 * 与 `/api/sites` 相同：Edge Runtime + 动态处理 + CDN 缓存。
 */
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const CACHE_HEADER = 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400';

function json(body: unknown, init?: ResponseInit): Response {
  return Response.json(body, {
    ...init,
    headers: {
      'cache-control': CACHE_HEADER,
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, OPTIONS',
      ...init?.headers,
    },
  });
}

export function OPTIONS(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, OPTIONS',
      'access-control-max-age': '86400',
    },
  });
}

export function GET(request: Request): Response {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug')?.trim() ?? '';
  const categories = getCategoriesWithCount();

  if (slug) {
    const category = categories.find((item) => item.slug === slug);
    if (!category) {
      return json(
        { error: { code: 'not_found', message: `未知分类：${slug}` } },
        { status: 404, headers: { 'cache-control': 'no-store' } },
      );
    }
    return json({ total: 1, items: [category] });
  }

  return json({ total: categories.length, items: categories });
}
