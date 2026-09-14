/**
 * 分类二级化迁移（M6）
 *
 * 二级分类上线后，把 `data/sites/*.json` 与 `data/catalog/*.json` 中显式钉死的
 * 一级分类（infra / model / agent / image）迁移到更精确的二级分类。
 *
 * **安全约束：只在该一级分类的子树内迁移** —— 候选集固定为「父分类 + 其子分类」，
 * 未命中任何子分类时保持原值，因此不会把条目误迁到别的一级分类。
 *
 * 用法：
 *   pnpm migrate:categories           # 预览变更（默认不写文件）
 *   pnpm migrate:categories --apply   # 应用变更
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ICON_META } from '../src/data/icons.generated';
import { CATALOG_SOURCES, CATEGORIES, SITE_OVERRIDE_SOURCES } from '../src/data/registry';
import { resolveCategory } from '../src/lib/sites';
import type { Category, SiteOverride } from '../src/types/site';
import { logger } from './utils/log';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** 已细分的子树根（既有子分类的一级分类） */
const SUBTREE_ROOTS = CATEGORIES.filter(
  (category) => !category.parent && CATEGORIES.some((child) => child.parent === category.slug),
).map((category) => category.slug);

const childrenOf = (slug: string): Category[] =>
  CATEGORIES.filter((category) => category.parent === slug);

/**
 * 在指定一级分类的子树内归类。
 *
 * 复用 `resolveCategory`（平票时更深的分类优先，见该函数的说明），
 * 候选集限制在子树内；若结果落在子树外（说明触发了 group 兜底），保持原分类不变。
 */
function classifyInSubtree(iconId: string, parentSlug: string): string {
  const meta = ICON_META.find((item) => item.id === iconId);
  const parent = CATEGORIES.find((category) => category.slug === parentSlug);
  if (!meta || !parent) return parentSlug;

  const candidates = [parent, ...childrenOf(parentSlug)];
  const picked = resolveCategory(meta, candidates);

  return candidates.some((category) => category.slug === picked) ? picked : parentSlug;
}

interface Change {
  file: string;
  iconId: string;
  from: string;
  to: string;
}

function migrateFile(relativePath: string, apply: boolean, changes: Change[]): void {
  const filePath = resolve(ROOT, relativePath);
  const entries = JSON.parse(readFileSync(filePath, 'utf8')) as SiteOverride[];

  for (const entry of entries) {
    if (!entry.category || !SUBTREE_ROOTS.includes(entry.category)) continue;

    const next = classifyInSubtree(entry.iconId, entry.category);
    if (next === entry.category) continue;

    changes.push({ file: relativePath, iconId: entry.iconId, from: entry.category, to: next });
    entry.category = next;
  }

  if (apply && changes.some((change) => change.file === relativePath)) {
    writeFileSync(filePath, `${JSON.stringify(entries, null, 2)}\n`, 'utf8');
  }
}

function main() {
  const apply = process.argv.slice(2).includes('--apply');
  const changes: Change[] = [];

  for (const relativePath of Object.values(SITE_OVERRIDE_SOURCES)) {
    migrateFile(relativePath, apply, changes);
  }
  for (const relativePath of Object.values(CATALOG_SOURCES)) {
    migrateFile(relativePath, apply, changes);
  }

  if (changes.length === 0) {
    logger.success('无需迁移：所有条目都已在最精确的分类下');
    return;
  }

  const byTarget = new Map<string, number>();
  for (const change of changes) {
    byTarget.set(
      `${change.from} → ${change.to}`,
      (byTarget.get(`${change.from} → ${change.to}`) ?? 0) + 1,
    );
  }

  logger.summary(apply ? '分类迁移已应用' : '分类迁移预览（未写文件）', {
    待迁移条目: changes.length,
    涉及分类组合: byTarget.size,
  });

  for (const [pair, count] of [...byTarget.entries()].sort((a, b) => b[1] - a[1])) {
    logger.info(`${pair}：${count} 条`);
  }

  if (!apply) {
    logger.info('确认无误后执行 pnpm migrate:categories --apply');
  } else {
    logger.info('请运行 pnpm validate:data 复核，并检查页面归类是否符合预期');
  }
}

main();
