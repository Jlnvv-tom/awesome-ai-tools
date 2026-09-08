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
  CategoriesFileSchema,
  SiteOverridesFileSchema,
  SiteSchema,
  TagsFileSchema,
  findTrackingParams,
} from '../src/data/schema';
import { CATEGORIES, SITE_OVERRIDES, TAGS } from '../src/data/registry';
import { getAllSites } from '../src/lib/sites';
import { logger } from './utils/log';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SITES_DIR = resolve(ROOT, 'data/sites');

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

    if (!iconIds.has(site.iconId)) error(`站点 ${site.id} 的 iconId 不存在：${site.iconId}`);
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
  const used = new Set(getAllSites().map((site) => site.iconId));
  const missing = ICON_META.filter((meta) => !used.has(meta.id)).map((meta) => meta.id);
  if (missing.length > 0) {
    warn(`${missing.length} 个图标未被收录为站点（可能标记了 visible: false）`);
  }
}

function main() {
  validateCategories();
  validateTags();
  validateOverrideFiles();
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
