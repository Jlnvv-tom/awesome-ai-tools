import { ICON_META } from '@/data/icons.generated';
import { STARS } from '@/data/metrics.generated';
import {
  ADDED_AT_DEFAULT,
  ADDED_AT_MAP,
  CATALOG_ENTRIES,
  CATEGORIES,
  FAVICON_ID_SET,
  FAVICONS,
  SITE_OVERRIDES,
  TAGS,
} from '@/data/registry';
import { DEFAULT_LOCALE, type Locale } from '@/i18n/config';
import type {
  CatalogEntry,
  Category,
  IconGroup,
  IconMeta,
  Site,
  SiteOverride,
  SiteStats,
} from '@/types/site';

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
 * 自动归类：按「命中关键词长度之和」打分，长关键词（更具体）天然优先。
 *
 * 平票时的取舍顺序（二级分类上线后新增，见 ADR 0010）：
 * 1. **更深的分类优先** —— 下放到二级的关键词通常仍保留在父分类里（如 `groq` 同时在
 *    infra 与 inference），若沿用「取 order 小者」，父分类会永远胜出、二级分类形同虚设；
 * 2. 深度相同时取 `order` 更小者，保持既有行为。
 */
export function resolveCategory(meta: IconMeta, categories: Category[]): string {
  const haystack = `${meta.fullTitle} ${meta.title} ${meta.id} ${hostOf(meta.url)}`.toLowerCase();

  let best: { slug: string; score: number; order: number; depth: number } | null = null;
  for (const category of categories) {
    const score = category.keywords.reduce((sum, keyword) => {
      const value = keyword.toLowerCase();
      return haystack.includes(value) ? sum + value.length : sum;
    }, 0);
    if (score === 0) continue;

    const depth = category.parent ? 1 : 0;
    const better =
      !best ||
      score > best.score ||
      (score === best.score && depth > best.depth) ||
      (score === best.score && depth === best.depth && category.order < best.order);

    if (better) best = { slug: category.slug, score, order: category.order, depth };
  }

  return best?.slug ?? GROUP_FALLBACK_CATEGORY[meta.group];
}

function deriveDescription(meta: IconMeta): string {
  return `LobeHub Icons 收录的${GROUP_LABEL[meta.group]}「${meta.fullTitle}」，点击直达官网。`;
}

/** 由 lobehub 图标库派生的条目（可被 SiteOverride 浅覆盖） */
function buildLobehubSite(
  meta: IconMeta,
  override: SiteOverride | undefined,
  categories: Category[],
): Site {
  const site: Site = {
    id: slugify(meta.id),
    iconId: meta.id,
    iconSource: 'lobehub',
    name: meta.fullTitle,
    nameCn: undefined,
    url: meta.url,
    category: override?.category ?? resolveCategory(meta, categories),
    tags: override?.tags ?? [],
    description: override?.description ?? deriveDescription(meta),
    featured: override?.featured ?? false,
    order: override?.order ?? DEFAULT_ORDER,
    color: meta.color,
    hasColor: meta.param.hasColor,
    curated: Boolean(override),
    addedAt: override?.addedAt ?? ADDED_AT_MAP[meta.id] ?? ADDED_AT_DEFAULT,
    pricing: override?.pricing ?? 'unknown',
    openSource: override?.openSource ?? 'unknown',
    chineseSupport: override?.chineseSupport ?? 'unknown',
    github: override?.github,
  };

  if (override?.name) site.name = override.name;
  if (override?.nameCn) site.nameCn = override.nameCn;
  if (override?.url) site.url = override.url;
  return site;
}

/**
 * 自主收录条目（`data/catalog/*.json`）→ Site。
 *
 * 图标来源三态：显式填了 `iconId` 说明该工具已被图标库收录，复用官方图标；
 * 否则看本地 favicon 是否已抓取；都没有则退回品牌色首字母块。
 */
function buildCatalogSite(entry: CatalogEntry): Site {
  const meta = entry.iconId ? getIconMeta(entry.iconId) : undefined;

  let iconSource: Site['iconSource'] = 'initial';
  if (entry.iconId) iconSource = 'lobehub';
  else if (FAVICON_ID_SET.has(entry.id)) iconSource = 'favicon';

  return {
    id: entry.id,
    iconId: entry.iconId ?? entry.id,
    iconSource,
    faviconUrl: iconSource === 'favicon' ? FAVICONS[entry.id] : undefined,
    name: entry.name,
    nameCn: entry.nameCn,
    url: entry.url,
    category: entry.category,
    tags: entry.tags,
    description: entry.description,
    featured: entry.featured ?? false,
    order: entry.order ?? DEFAULT_ORDER,
    color: entry.color,
    hasColor: meta?.param.hasColor ?? false,
    // 自主收录条目全部由人工维护（这也让「待认领」统计只覆盖 lobehub 派生条目）
    curated: true,
    addedAt: entry.addedAt,
    pricing: entry.pricing ?? 'unknown',
    openSource: entry.openSource ?? 'unknown',
    chineseSupport: entry.chineseSupport ?? 'unknown',
    github: entry.github,
  };
}

/**
 * 注入客观指标。
 *
 * 统一在合并完成后按最终 id 注入，避免 id 冲突重命名（`-xxx` 后缀）后查不到指标。
 */
function withStars(sites: Site[]): Site[] {
  return sites.map((site) =>
    STARS[site.id] === undefined ? site : { ...site, stars: STARS[site.id] },
  );
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
      const site = buildLobehubSite(meta, overrideMap.get(meta.id), CATEGORIES);
      return { ...site, id };
    },
  );

  // 合并自主收录条目（不在 lobehub 图标库中的工具）；id 冲突时以图标库条目为准并留痕
  for (const entry of CATALOG_ENTRIES) {
    if (entry.visible === false) continue;
    if (usedIds.has(entry.id)) {
      console.error(`[sites] 自主收录条目 id 与已有条目冲突，已跳过：${entry.id}`);
      continue;
    }
    usedIds.add(entry.id);
    sites.push(buildCatalogSite(entry));
  }

  cache = withStars(sites);
  return cache;
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

/** 一级分类（不填 parent），供导航与首页入口使用 */
export function getTopCategories(): Category[] {
  return CATEGORIES.filter((category) => !category.parent).sort((a, b) => a.order - b.order);
}

/** 某个分类的直接子分类（二级分类） */
export function getChildCategories(slug: string): Category[] {
  return CATEGORIES.filter((category) => category.parent === slug).sort(
    (a, b) => a.order - b.order,
  );
}

/**
 * 分类的作用域：自身 + 全部子分类的 slug。
 *
 * 一级分类页据此聚合二级分类条目；二级分类的作用域只含自身。
 */
export function getCategoryScope(slug: string): Set<string> {
  if (!CATEGORIES.some((category) => category.slug === slug)) return new Set<string>();

  const scope = new Set<string>([slug]);
  for (const child of getChildCategories(slug)) scope.add(child.slug);
  return scope;
}

/** 站点展示名：中文站优先中文名，英文站使用英文原名 */
export function getSiteDisplayName(site: Site, locale: Locale = DEFAULT_LOCALE): string {
  return locale === 'en' ? site.name : (site.nameCn ?? site.name);
}

/** 分类展示名：中文站用 name，英文站用 nameEn */
export function getCategoryName(category: Category, locale: Locale = DEFAULT_LOCALE): string {
  return locale === 'en' ? category.nameEn : category.name;
}

/** 按 slug 取站点（一级分类自动聚合其二级分类的条目），并按排序规则返回 */
export function getSitesByCategory(slug: string): Site[] {
  const scope = getCategoryScope(slug);
  if (scope.size === 0) return [];

  return getAllSites()
    .filter((site) => scope.has(site.category))
    .sort(byRank);
}

/**
 * 分类 + 条目数（按分类 order 排序）。
 *
 * 一级分类的 count 为「自身 + 全部子分类」的条目总数，与分类页展示口径保持一致。
 */
export function getCategoriesWithCount(): (Category & { count: number })[] {
  const counts = new Map<string, number>();
  for (const site of getAllSites()) {
    counts.set(site.category, (counts.get(site.category) ?? 0) + 1);
  }

  return [...CATEGORIES]
    .sort((a, b) => a.order - b.order)
    .map((category) => {
      let total = 0;
      for (const slug of getCategoryScope(category.slug)) {
        total += counts.get(slug) ?? 0;
      }
      return { ...category, count: total };
    });
}

/** 按 id 取站点 */
export function getSiteById(id: string): Site | undefined {
  return getAllSites().find((site) => site.id === id);
}

let iconMetaIndex: Map<string, IconMeta> | null = null;

function getIconMetaIndex(): Map<string, IconMeta> {
  if (!iconMetaIndex) {
    iconMetaIndex = new Map(ICON_META.map((meta) => [meta.id, meta]));
  }
  return iconMetaIndex;
}

/** 取站点关联的图标元数据（用一次性构建的索引查找，避免列表渲染里的 O(n²) 遍历） */
export function getIconMeta(iconId: string): IconMeta | undefined {
  return getIconMetaIndex().get(iconId);
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
