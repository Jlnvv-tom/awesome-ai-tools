/**
 * 数据注册表：把仓库根目录 `data/` 下的 JSON 以类型安全的方式暴露给应用与脚本。
 *
 * 约定：
 * - `data/categories.json` / `data/tags.json` 为受控词表；
 * - `data/sites/*.json` 为人工维护的站点覆盖项，按分类分片，新增分片需在此登记。
 */
import { ADDED_AT, ADDED_AT_FALLBACK } from '@/data/added-at.generated';
import { FAVICON_FILES } from '@/data/favicons.generated';
import catalogTools from '@data/catalog/tools.json';
import categoriesJson from '@data/categories.json';
import tagsJson from '@data/tags.json';

import agentSites from '@data/sites/agent.json';
import chatSites from '@data/sites/chat.json';
import codeSites from '@data/sites/code.json';
import imageSites from '@data/sites/image.json';
import infraSites from '@data/sites/infra.json';
import modelSites from '@data/sites/model.json';
import openSourceSites from '@data/sites/opensource.json';
import searchSites from '@data/sites/search.json';
import videoSites from '@data/sites/video.json';
import writingSites from '@data/sites/writing.json';

import type { CatalogEntry, Category, SiteOverride } from '@/types/site';

export const CATEGORIES = categoriesJson as Category[];

export const TAGS = tagsJson as string[];

/**
 * 自主收录条目（不在 @lobehub/icons 图标库中的工具）。
 *
 * 与 `SITE_OVERRIDES` 的区别：override 以 iconId 关联 lobehub 条目并做浅覆盖；
 * 这里的每条记录自成完整条目，直接合并进站点全集（id 去重）。
 */
export const CATALOG_ENTRIES: CatalogEntry[] = [...(catalogTools as CatalogEntry[])].sort((a, b) =>
  a.id.localeCompare(b.id),
);

/** 数据分片来源，便于错误提示与文档定位 */
export const CATALOG_SOURCES: Record<string, string> = {
  tools: 'data/catalog/tools.json',
};

/** 已在 public/icons/ 落地本地图标：条目 id → public 下的相对路径 */
export const FAVICONS: Record<string, string> = FAVICON_FILES;

/** 本地图标 id 集合，供图标来源判定使用 */
export const FAVICON_ID_SET = new Set<string>(Object.keys(FAVICON_FILES));

/** iconId → 收录日期（YYYY-MM-DD），由 `pnpm backfill:added-at` 按 git 历史生成 */
export const ADDED_AT_MAP = ADDED_AT;

/** 收录日期兜底值（未纳入 git 历史的新同步条目取最近一次同步日期） */
export const ADDED_AT_DEFAULT = ADDED_AT_FALLBACK;

export const SITE_OVERRIDES: SiteOverride[] = [
  ...chatSites,
  ...codeSites,
  ...imageSites,
  ...videoSites,
  ...agentSites,
  ...searchSites,
  ...writingSites,
  ...openSourceSites,
  ...infraSites,
  ...modelSites,
] as SiteOverride[];

/** 数据分片的来源文件名，便于错误提示与校验报告定位 */
export const SITE_OVERRIDE_SOURCES: Record<string, string> = {
  chat: 'data/sites/chat.json',
  code: 'data/sites/code.json',
  image: 'data/sites/image.json',
  video: 'data/sites/video.json',
  agent: 'data/sites/agent.json',
  search: 'data/sites/search.json',
  writing: 'data/sites/writing.json',
  opensource: 'data/sites/opensource.json',
  infra: 'data/sites/infra.json',
  model: 'data/sites/model.json',
};
