import { ICON_META } from '@/data/icons.generated';
import { ADDED_AT_DEFAULT, ADDED_AT_MAP, CATEGORIES, SITE_OVERRIDES, TAGS } from '@/data/registry';
import type { Category, IconGroup, IconMeta, Site, SiteOverride, SiteStats } from '@/types/site';

/**
 * 站点数据查询层：把「上游图标元数据」与「人工覆盖数据」合并为 Site[]。
 *
 * 合并规则见 docs/spec/10-data-model.md（覆盖优先于派生）。
 */

const GROUP_LABEL: Record<IconGroup, string> = {
  model: '模型',
  provider: '服务商',
  application: '应用',
};

/** group → 兜底分类（关键词未命中时使用） */
const GROUP_FALLBACK_CATEGORY: Record<IconGroup, string> = {
  model: 'model',
  provider: 'infra',
  application: 'agent',
};

const DEFAULT_ORDER = 9999;

/** 以 base 为基准向前推 days 天，返回 YYYY-MM-DD（ISO 日期可直接字典序比较） */
function dayBefore(base: Date, days: number): string {
  return new Date(base.getTime() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/** OpenAI → openai；用于路由与 id */
export function slugify(id: string): string {
  return id
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/**
 * 自动归类：按「命中关键词长度之和」打分，分数相同时取 order 更小的分类。
 * 这样长关键词（更具体）天然优先于短关键词。
 */
export function resolveCategory(meta: IconMeta, categories: Category[]): string {
  const haystack = `${meta.fullTitle} ${meta.title} ${meta.id} ${hostOf(meta.url)}`.toLowerCase();

  let best: { slug: string; score: number; order: number } | null = null;
  for (const category of categories) {
    const score = category.keywords.reduce((sum, keyword) => {
      const value = keyword.toLowerCase();
      return haystack.includes(value) ? sum + value.length : sum;
    }, 0);
    if (score === 0) continue;
    if (!best || score > best.score || (score === best.score && category.order < best.order)) {
      best = { slug: category.slug, score, order: category.order };
    }
  }

  return best?.slug ?? GROUP_FALLBACK_CATEGORY[meta.group];
}

function deriveDescription(meta: IconMeta): string {
  return `LobeHub Icons 收录的${GROUP_LABEL[meta.group]}「${meta.fullTitle}」，点击直达官网。`;
}

function buildSite(meta: IconMeta, override: SiteOverride | undefined, categories: Category[]) {
  const site: Site = {
    id: slugify(meta.id),
    iconId: meta.id,
    name: meta.fullTitle,
    nameCn: undefined,
    url: meta.url,
    category: override?.category ?? resolveCategory(meta, categories),
    tags: override?.tags ?? [],
    description: override?.description ?? deriveDescription(meta),
    featured: override?.featured ?? false,
    order: override?.order ?? DEFAULT_ORDER,
    color: meta.color,
    curated: Boolean(override),
    addedAt: override?.addedAt ?? ADDED_AT_MAP[meta.id] ?? ADDED_AT_DEFAULT,
    pricing: override?.pricing ?? 'unknown',
    openSource: override?.openSource ?? 'unknown',
    chineseSupport: override?.chineseSupport ?? 'unknown',
  };

  if (override?.name) site.name = override.name;
  if (override?.nameCn) site.nameCn = override.nameCn;
  if (override?.url) site.url = override.url;
  return site;
}

let cache: Site[] | null = null;

/** 全量站点（已应用人工覆盖，已过滤 visible: false） */
export function getAllSites(): Site[] {
  if (cache) return cache;

  const overrideMap = new Map(SITE_OVERRIDES.map((item) => [item.iconId, item]));
  const usedIds = new Set<string>();

  const sites = ICON_META.filter((meta) => overrideMap.get(meta.id)?.visible !== false).map(
    (meta) => {
      let id = slugify(meta.id);
      if (usedIds.has(id)) id = `${id}-${meta.id.toLowerCase()}`;
      usedIds.add(id);
      const site = buildSite(meta, overrideMap.get(meta.id), CATEGORIES);
      return { ...site, id };
    },
  );

  cache = sites;
  return sites;
}

function byRank(a: Site, b: Site): number {
  if (a.order !== b.order) return a.order - b.order;
  return a.name.localeCompare(b.name);
}

/** 判断收录日期是否落在最近 days 天内（以运行时间为基准） */
export function isWithinDays(day: string, days: number): boolean {
  return day >= dayBefore(new Date(), days);
}

/**
 * 最近收录的站点。
 *
 * 默认取最近 7 天新增；窗口内无新增时降级为「最近收录」的若干条，避免首页出现空白区块。
 * 排序规则：收录日期倒序，同日按 order 与名称。
 */
export function getRecentSites(options: { days?: number; limit?: number } = {}): Site[] {
  const { days = 7, limit = 8 } = options;
  const byAddedAtDesc = (a: Site, b: Site) => {
    if (a.addedAt !== b.addedAt) return a.addedAt < b.addedAt ? 1 : -1;
    return byRank(a, b);
  };

  const sites = getAllSites();
  const fresh = sites.filter((site) => isWithinDays(site.addedAt, days));
  const pool = fresh.length > 0 ? fresh : sites;

  return [...pool].sort(byAddedAtDesc).slice(0, limit);
}

/** 首页精选 */
export function getFeaturedSites(limit?: number): Site[] {
  const featured = getAllSites()
    .filter((site) => site.featured)
    .sort(byRank);
  return limit ? featured.slice(0, limit) : featured;
}

/** 按 slug 取分类 */
export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((category) => category.slug === slug);
}

/** 按 slug 取站点，并按排序规则返回 */
export function getSitesByCategory(slug: string): Site[] {
  return getAllSites()
    .filter((site) => site.category === slug)
    .sort(byRank);
}

/** 分类 + 条目数（按分类 order 排序） */
export function getCategoriesWithCount(): (Category & { count: number })[] {
  const counts = new Map<string, number>();
  for (const site of getAllSites()) {
    counts.set(site.category, (counts.get(site.category) ?? 0) + 1);
  }
  return [...CATEGORIES]
    .sort((a, b) => a.order - b.order)
    .map((category) => ({ ...category, count: counts.get(category.slug) ?? 0 }));
}

/** 按 id 取站点 */
export function getSiteById(id: string): Site | undefined {
  return getAllSites().find((site) => site.id === id);
}

/** 取站点关联的图标元数据 */
export function getIconMeta(iconId: string): IconMeta | undefined {
  return ICON_META.find((meta) => meta.id === iconId);
}

/** 同分类 / 同标签的相关推荐 */
export function getRelatedSites(site: Site, limit = 8): Site[] {
  const scored = getAllSites()
    .filter((item) => item.id !== site.id)
    .map((item) => {
      let score = 0;
      if (item.category === site.category) score += 3;
      for (const tag of item.tags) {
        if (site.tags.includes(tag)) score += 2;
      }
      return { item, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.item.order - b.item.order);

  return scored.slice(0, limit).map((entry) => entry.item);
}

/** 首页统计信息 */
export function getStats(): SiteStats {
  const sites = getAllSites();
  return {
    total: sites.length,
    curated: sites.filter((site) => site.curated).length,
    categories: CATEGORIES.length,
    tags: TAGS.length,
  };
}
