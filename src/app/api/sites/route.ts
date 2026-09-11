import { CATEGORIES, TAGS } from '@/data/registry';
import type { Site } from '@/types/site';
import { getAllSites } from '@/lib/sites';

/**
 * 开放 API：站点列表。
 *
 * 运行在 Edge Runtime（同时兼容 Vercel 与 Cloudflare Pages），
 * 因此**不能**使用 `force-static`（静态化后读不到查询参数），
 * 也不能使用 ISR 的 `revalidate`（Edge Runtime 不支持），缓存统一交给 CDN。
 */
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

const CACHE_HEADER = 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400';

/** 对外输出字段（与内部模型保持一致，便于第三方直接复用） */
function toItem(site: Site) {
  return {
    id: site.id,
    iconId: site.iconId,
    name: site.name,
    nameCn: site.nameCn ?? null,
    url: site.url,
    category: site.category,
    tags: site.tags,
    description: site.description,
    featured: site.featured,
    order: site.order,
    color: site.color,
    pricing: site.pricing,
    openSource: site.openSource,
    chineseSupport: site.chineseSupport,
    addedAt: site.addedAt,
    curated: site.curated,
  };
}

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

function error(status: number, code: string, message: string): Response {
  return json({ error: { code, message } }, { status, headers: { 'cache-control': 'no-store' } });
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
  const warnings: string[] = [];

  const category = searchParams.get('category')?.trim() ?? '';
  if (category && !CATEGORIES.some((item) => item.slug === category)) {
    return error(400, 'invalid_category', `未知分类：${category}`);
  }

  const tag = searchParams.get('tag')?.trim() ?? '';
  if (tag && !TAGS.includes(tag)) {
    return error(400, 'invalid_tag', `未登记的标签：${tag}`);
  }

  const query = searchParams.get('q')?.trim().toLowerCase() ?? '';

  const featuredParam = searchParams.get('featured');
  let featured: boolean | null = null;
  if (featuredParam !== null) {
    if (featuredParam === 'true' || featuredParam === 'false') {
      featured = featuredParam === 'true';
    } else {
      warnings.push(`featured 取值非法（${featuredParam}），已忽略该筛选条件`);
    }
  }

  const limit = parseBoundedInt(
    searchParams.get('limit'),
    DEFAULT_LIMIT,
    1,
    MAX_LIMIT,
    'limit',
    warnings,
  );
  const offset = parseBoundedInt(
    searchParams.get('offset'),
    0,
    0,
    Number.MAX_SAFE_INTEGER,
    'offset',
    warnings,
  );

  let items = getAllSites();

  if (category) items = items.filter((site) => site.category === category);
  if (tag) items = items.filter((site) => site.tags.includes(tag));
  if (featured !== null) items = items.filter((site) => site.featured === featured);
  if (query) {
    items = items.filter((site) =>
      [site.name, site.nameCn ?? '', site.description, site.tags.join(' ')]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }

  const total = items.length;
  const page = items.slice(offset, offset + limit);

  return json({
    total,
    limit,
    offset,
    count: page.length,
    warnings,
    items: page.map(toItem),
  });
}

/** 解析有界整数，非法值降级为默认值并记录 warning */
function parseBoundedInt(
  raw: string | null,
  fallback: number,
  min: number,
  max: number,
  field: string,
  warnings: string[],
): number {
  if (raw === null || raw.trim() === '') return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value)) {
    warnings.push(`${field} 取值非法（${raw}），已使用默认值 ${fallback}`);
    return fallback;
  }
  if (value < min || value > max) {
    const clamped = Math.min(Math.max(value, min), max);
    warnings.push(`${field} 超出范围（${value}），已收敛为 ${clamped}`);
    return clamped;
  }
  return value;
}
