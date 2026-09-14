/**
 * 数据校验脚本（SDD 门禁）
 *
 * 检查项见 docs/spec/10-data-model.md#7。
 * error → 进程非 0 退出并阻断 CI；warn → 仅提示。
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ICON_META } from '../src/data/icons.generated';
import {
  CatalogFileSchema,
  CategoriesFileSchema,
  SiteOverridesFileSchema,
  SiteSchema,
  TagsFileSchema,
  findTrackingParams,
} from '../src/data/schema';
import { CATEGORIES, SITE_OVERRIDES, TAGS } from '../src/data/registry';
import { getAllSites, slugify } from '../src/lib/sites';
import { logger } from './utils/log';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SITES_DIR = resolve(ROOT, 'data/sites');
const CATALOG_DIR = resolve(ROOT, 'data/catalog');

interface Issue {
  level: 'error' | 'warn';
  message: string;
}

const issues: Issue[] = [];
const error = (message: string) => issues.push({ level: 'error', message });
const warn = (message: string) => issues.push({ level: 'warn', message });

function validateCategories() {
  const result = CategoriesFileSchema.safeParse(CATEGORIES);
  if (!result.success) {
    for (const item of result.error.issues) {
      error(`data/categories.json → ${item.path.join('.')}：${item.message}`);
    }
    return;
  }
  const seen = new Set<string>();
  for (const category of CATEGORIES) {
    if (seen.has(category.slug)) error(`分类 slug 重复：${category.slug}`);
    seen.add(category.slug);
  }

  // 层级校验：仅支持两级，parent 必须指向一级分类
  for (const category of CATEGORIES) {
    if (!category.parent) continue;

    const parent = CATEGORIES.find((item) => item.slug === category.parent);
    if (!parent) {
      error(`分类 ${category.slug} 的 parent 不存在：${category.parent}`);
      continue;
    }
    if (parent.parent) {
      error(`分类 ${category.slug} 的 parent 指向了二级分类（仅支持两级）：${category.parent}`);
    }
  }
}

function validateTags() {
  const result = TagsFileSchema.safeParse(TAGS);
  if (!result.success) {
    for (const item of result.error.issues) {
      error(`data/tags.json → ${item.path.join('.')}：${item.message}`);
    }
    return;
  }
  const seen = new Set<string>();
  for (const tag of TAGS) {
    if (seen.has(tag)) error(`标签重复：${tag}`);
    seen.add(tag);
  }
}

function validateOverrideFiles() {
  for (const file of readdirSync(SITES_DIR)
    .filter((name) => name.endsWith('.json'))
    .sort()) {
    const path = `data/sites/${file}`;
    let parsed: unknown;
    try {
      parsed = JSON.parse(readFileSync(resolve(SITES_DIR, file), 'utf8'));
    } catch (cause) {
      error(`${path} 不是合法 JSON：${(cause as Error).message}`);
      continue;
    }
    const result = SiteOverridesFileSchema.safeParse(parsed);
    if (!result.success) {
      for (const item of result.error.issues) {
        error(`${path} → ${item.path.join('.')}：${item.message}`);
      }
    }
  }
}

/** 图标库派生条目的最终 id（与 getAllSites 的冲突重命名规则保持一致） */
function collectLobehubIds(): Set<string> {
  const ids = new Set<string>();
  for (const meta of ICON_META) {
    let id = slugify(meta.id);
    if (ids.has(id)) id = `${id}-${meta.id.toLowerCase()}`;
    ids.add(id);
  }
  return ids;
}

function validateCatalogFiles() {
  const lobehubIds = collectLobehubIds();
  const seen = new Set<string>();

  for (const file of readdirSync(CATALOG_DIR)
    .filter((name) => name.endsWith('.json'))
    .sort()) {
    const path = `data/catalog/${file}`;
    let parsed: unknown;
    try {
      parsed = JSON.parse(readFileSync(resolve(CATALOG_DIR, file), 'utf8'));
    } catch (cause) {
      error(`${path} 不是合法 JSON：${(cause as Error).message}`);
      continue;
    }

    const result = CatalogFileSchema.safeParse(parsed);
    if (!result.success) {
      for (const item of result.error.issues) {
        error(`${path} → ${item.path.join('.')}：${item.message}`);
      }
      continue;
    }

    for (const entry of result.data) {
      if (seen.has(entry.id)) error(`自主收录条目 id 重复：${entry.id}（${path}）`);
      if (lobehubIds.has(entry.id)) {
        error(`自主收录条目 id 与图标库派生条目冲突：${entry.id}（${path}）`);
      }
      if (entry.iconId && !ICON_META.some((meta) => meta.id === entry.iconId)) {
        error(`${path} → ${entry.id} 引用了不存在的图标：${entry.iconId}`);
      }
      seen.add(entry.id);
    }
  }
}

function validateSites() {
  const iconIds = new Set(ICON_META.map((meta) => meta.id));
  const categorySlugs = new Set(CATEGORIES.map((category) => category.slug));
  const tagSet = new Set(TAGS);

  const sites = getAllSites();
  const seenIds = new Set<string>();
  const urlOwners = new Map<string, string[]>();
  let uncurated = 0;

  for (const site of sites) {
    const result = SiteSchema.safeParse(site);
    if (!result.success) {
      for (const item of result.error.issues) {
        error(`站点 ${site.id} → ${item.path.join('.')}：${item.message}`);
      }
    }

    // 只有图标库派生的条目才要求 iconId 命中图标元数据；
    // 自主收录条目的 iconId 是自身 id 或显式复用的图标 id（后者已在 validateCatalogFiles 校验）
    if (site.iconSource === 'lobehub' && !iconIds.has(site.iconId)) {
      error(`站点 ${site.id} 的 iconId 不存在：${site.iconId}`);
    }
    if (!categorySlugs.has(site.category)) {
      error(`站点 ${site.id} 的分类未登记：${site.category}`);
    }
    for (const tag of site.tags) {
      if (!tagSet.has(tag)) error(`站点 ${site.id} 使用了未登记的标签：${tag}`);
    }
    if (seenIds.has(site.id)) error(`站点 id 重复：${site.id}`);
    seenIds.add(site.id);

    const tracking = findTrackingParams(site.url);
    if (tracking.length > 0) {
      warn(`站点 ${site.id} 的官网链接疑似含追踪参数（${tracking.join(', ')}）`);
    }

    const owners = urlOwners.get(site.url) ?? [];
    owners.push(site.id);
    urlOwners.set(site.url, owners);

    if (!site.curated) uncurated += 1;
  }

  for (const [url, owners] of urlOwners) {
    if (owners.length > 1) warn(`官网地址被多个条目引用：${url}（${owners.join(', ')}）`);
  }

  if (uncurated > 0) {
    warn(`有 ${uncurated} 个条目尚未人工维护（分类与简介为自动派生），欢迎认领补充`);
  }

  return sites;
}

function validateOverridesReference() {
  const iconIds = new Set(ICON_META.map((meta) => meta.id));
  for (const override of SITE_OVERRIDES) {
    if (!iconIds.has(override.iconId)) {
      error(`覆盖项引用了不存在的图标：${override.iconId}`);
    }
  }
}

function validateIconCoverage() {
  const used = new Set(
    getAllSites()
      .filter((site) => site.iconSource === 'lobehub')
      .map((site) => site.iconId),
  );
  const missing = ICON_META.filter((meta) => !used.has(meta.id)).map((meta) => meta.id);
  if (missing.length > 0) {
    warn(`${missing.length} 个图标未被收录为站点（可能标记了 visible: false）`);
  }
}

function main() {
  validateCategories();
  validateTags();
  validateOverrideFiles();
  validateCatalogFiles();
  validateOverridesReference();
  const sites = validateSites();
  validateIconCoverage();

  const errors = issues.filter((issue) => issue.level === 'error');
  const warnings = issues.filter((issue) => issue.level === 'warn');

  for (const issue of warnings) logger.warn(issue.message);
  for (const issue of errors) logger.error(issue.message);

  logger.summary('数据校验完成', {
    站点总数: sites.length,
    人工维护: sites.filter((site) => site.curated).length,
    自主收录: sites.filter((site) => site.iconSource !== 'lobehub').length,
    分类数: CATEGORIES.length,
    标签数: TAGS.length,
    错误: errors.length,
    警告: warnings.length,
  });

  if (errors.length > 0) {
    logger.error(`存在 ${errors.length} 个错误，请修复后重新提交`);
    process.exit(1);
  }
  logger.success('数据校验通过');
}

main();
