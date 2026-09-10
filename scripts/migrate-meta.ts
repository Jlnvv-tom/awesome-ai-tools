/**
 * 元信息迁移脚本：把既有标签提升为结构化字段。
 *
 * 迁移规则（迁移后从 tags 中移除对应标签，避免与详情页元信息重复）：
 *   - `free`          → `pricing: 'free'`
 *   - `open-source`   → `openSource: 'yes'`
 *   - `chinese`       → `chineseSupport: 'yes'`
 *
 * 脚本幂等：标签已移除且字段已写入后重复执行不产生变化。
 *
 * 用法：
 *   pnpm migrate:meta          # 执行迁移
 *   pnpm migrate:meta --check  # 只检查是否还有待迁移标签，不写文件
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { SiteOverride } from '../src/types/site';
import { logger } from './utils/log';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SITES_DIR = resolve(ROOT, 'data/sites');

/** 标签 → 元信息字段的迁移映射 */
const MIGRATIONS: {
  tag: string;
  field: 'pricing' | 'openSource' | 'chineseSupport';
  value: string;
}[] = [
  { tag: 'free', field: 'pricing', value: 'free' },
  { tag: 'open-source', field: 'openSource', value: 'yes' },
  { tag: 'chinese', field: 'chineseSupport', value: 'yes' },
];

interface MigrationStats {
  files: number;
  entries: number;
  pricing: number;
  openSource: number;
  chineseSupport: number;
}

function migrate(items: SiteOverride[], stats: MigrationStats): SiteOverride[] {
  return items.map((item) => {
    if (!item.tags || item.tags.length === 0) return item;

    let next: SiteOverride = item;
    let remaining = item.tags;

    for (const migration of MIGRATIONS) {
      if (!remaining.includes(migration.tag)) continue;

      // 已有显式字段值时以人工填写为准，只移除标签
      const alreadySet = next[migration.field] !== undefined;
      if (!alreadySet) {
        next = { ...next, [migration.field]: migration.value } as SiteOverride;
        stats[migration.field] += 1;
      }
      remaining = remaining.filter((tag) => tag !== migration.tag);
    }

    if (remaining.length === item.tags.length) return item;
    stats.entries += 1;
    return { ...next, tags: remaining };
  });
}

function main() {
  const args = process.argv.slice(2);
  const checkOnly = args.includes('--check');

  const files = readdirSync(SITES_DIR)
    .filter((name) => name.endsWith('.json'))
    .sort();

  const stats: MigrationStats = {
    files: 0,
    entries: 0,
    pricing: 0,
    openSource: 0,
    chineseSupport: 0,
  };

  let pending = 0;
  const changed: string[] = [];

  for (const file of files) {
    const path = resolve(SITES_DIR, file);
    const original = readFileSync(path, 'utf8');
    const items = JSON.parse(original) as SiteOverride[];
    const next = migrate(items, stats);
    const serialized = `${JSON.stringify(next, null, 2)}\n`;

    // 只比较数据，不比较排版（prettier 可能调整缩进与换行）
    if (JSON.stringify(next) === JSON.stringify(items)) continue;
    pending += 1;
    changed.push(file);
    if (!checkOnly) {
      writeFileSync(path, serialized, 'utf8');
      stats.files += 1;
    }
  }

  if (checkOnly) {
    if (pending === 0) {
      logger.success('元信息迁移已完成，无待迁移标签');
      return;
    }
    logger.error(`仍有 ${pending} 个分片待迁移：${changed.join(', ')}`);
    process.exit(1);
  }

  logger.summary('元信息迁移完成', {
    改动分片: stats.files,
    改动条目: stats.entries,
    定价: stats.pricing,
    开源: stats.openSource,
    中文支持: stats.chineseSupport,
  });

  logger.info('请继续执行 pnpm validate:data 与 pnpm build:search');
}

main();
