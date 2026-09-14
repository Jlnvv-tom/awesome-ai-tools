/**
 * 批量导入自主收录条目（M6）
 *
 * 把 CSV / JSON 清单转换为 `data/catalog/tools.json` 条目，内置四道校验：
 * Zod schema、id 冲突（与图标库派生条目及既有 catalog）、URL 重复、分类与标签登记情况。
 * 默认只预览，`--apply` 才写入。
 *
 * 用法：
 *   pnpm import:catalog data/catalog/batch.csv              # 预览
 *   pnpm import:catalog data/catalog/batch.csv --apply      # 写入
 *
 * CSV 表头（首行，字段顺序不限）：
 *   id,name,nameCn,url,category,tags,description,color,addedAt,pricing,openSource,chineseSupport,github
 *   - tags 用 `|` 分隔（避免与 CSV 逗号冲突）
 *   - color 留空时使用默认品牌色
 *   - 可选列留空即视为未填写
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { extname, resolve } from 'node:path';

import { CatalogEntrySchema } from '../src/data/schema';
import { CATALOG_ENTRIES, CATEGORIES, TAGS } from '../src/data/registry';
import { getAllSites } from '../src/lib/sites';
import type { CatalogEntry } from '../src/types/site';
import { logger } from './utils/log';

const CATALOG_FILE = 'data/catalog/tools.json';
const DEFAULT_COLOR = '#6e56f8';

type Row = Record<string, string>;

/** 解析一行 CSV（支持双引号包裹与转义的双引号） */
function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (char === ',' && !quoted) {
      cells.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  cells.push(current);
  return cells;
}

function parseCsv(text: string): Row[] {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]).map((header) => header.trim());

  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    const row: Row = {};
    headers.forEach((header, index) => {
      row[header] = (cells[index] ?? '').trim();
    });
    return row;
  });
}

function parseJson(text: string): Row[] {
  const parsed = JSON.parse(text) as Row[];
  return parsed.map((row) => {
    const normalized: Row = {};
    for (const [key, value] of Object.entries(row)) {
      normalized[key] = Array.isArray(value)
        ? value.join('|')
        : value === undefined || value === null
          ? ''
          : String(value);
    }
    return normalized;
  });
}

/** 行 → 条草案（空字符串归一为 undefined，交由 schema 判定必填） */
function toDraft(row: Row): Record<string, unknown> {
  const optional = (key: string) => (row[key] ? row[key] : undefined);

  return {
    id: row.id,
    name: row.name,
    nameCn: optional('nameCn'),
    url: row.url,
    category: row.category,
    tags: row.tags
      ? row.tags
          .split('|')
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [],
    description: row.description,
    color: row.color || DEFAULT_COLOR,
    featured: row.featured ? row.featured === 'true' : undefined,
    order: row.order ? Number(row.order) : undefined,
    addedAt: row.addedAt,
    pricing: optional('pricing'),
    openSource: optional('openSource'),
    chineseSupport: optional('chineseSupport'),
    github: optional('github'),
  };
}

function usage(): void {
  logger.warn('用法：pnpm import:catalog <file.csv|file.json> [--apply]');
  logger.info(
    '表头：id,name,nameCn,url,category,tags,description,color,addedAt,pricing,openSource,chineseSupport,github',
  );
}

function main() {
  const args = process.argv.slice(2);
  const input = args.find((arg) => !arg.startsWith('--'));
  const apply = args.includes('--apply');

  if (!input) {
    usage();
    process.exit(1);
  }

  const filePath = resolve(process.cwd(), input);
  const text = readFileSync(filePath, 'utf8');
  const rows = extname(input).toLowerCase() === '.json' ? parseJson(text) : parseCsv(text);

  if (rows.length === 0) {
    logger.warn('没有解析到任何数据行，请检查文件是否包含表头与内容');
    return;
  }

  const sites = getAllSites();
  const existingIds = new Set(sites.map((site) => site.id));
  const urlOwner = new Map(sites.map((site) => [site.url.toLowerCase(), site.id]));
  const categorySlugs = new Set(CATEGORIES.map((category) => category.slug));
  const tagSet = new Set(TAGS);

  const accepted: CatalogEntry[] = [];
  const rejected: { id: string; reason: string }[] = [];

  for (const row of rows) {
    const draft = toDraft(row);
    const label = String(row.id || row.name || '(未命名行)');

    const parsed = CatalogEntrySchema.safeParse(draft);
    if (!parsed.success) {
      rejected.push({
        id: label,
        reason: parsed.error.issues
          .map((issue) => `${issue.path.join('.') || 'row'} ${issue.message}`)
          .join('；'),
      });
      continue;
    }

    const entry = parsed.data;

    if (existingIds.has(entry.id)) {
      rejected.push({ id: entry.id, reason: 'id 已存在（与图标库派生条目或既有 catalog 冲突）' });
      continue;
    }
    const owner = urlOwner.get(entry.url.toLowerCase());
    if (owner) {
      rejected.push({ id: entry.id, reason: `官网地址已被条目占用：${owner}` });
      continue;
    }
    if (!categorySlugs.has(entry.category)) {
      rejected.push({ id: entry.id, reason: `分类未登记：${entry.category}` });
      continue;
    }
    const unknownTags = entry.tags.filter((tag) => !tagSet.has(tag));
    if (unknownTags.length > 0) {
      rejected.push({ id: entry.id, reason: `标签未登记：${unknownTags.join(', ')}` });
      continue;
    }

    accepted.push(entry);
    // 同批次内去重：后续重复的 id / url 也会被拦截
    existingIds.add(entry.id);
    urlOwner.set(entry.url.toLowerCase(), entry.id);
  }

  for (const item of rejected) logger.error(`${item.id} → ${item.reason}`);

  if (accepted.length === 0) {
    logger.summary('导入结束：没有可写入的条目', {
      待导入: rows.length,
      校验失败: rejected.length,
    });
    process.exit(rejected.length > 0 ? 1 : 0);
  }

  if (!apply) {
    logger.summary('导入预览（未写文件）', {
      待导入: accepted.length,
      校验失败: rejected.length,
      写入目标: CATALOG_FILE,
    });
    for (const entry of accepted) logger.info(`+ ${entry.id}（${entry.nameCn ?? entry.name}）`);
    logger.info('确认无误后追加 --apply 写入');
    return;
  }

  const merged = [...CATALOG_ENTRIES, ...accepted].sort((a, b) => a.id.localeCompare(b.id));
  writeFileSync(
    resolve(process.cwd(), CATALOG_FILE),
    `${JSON.stringify(merged, null, 2)}\n`,
    'utf8',
  );

  logger.summary('导入完成', {
    新增: accepted.length,
    校验失败: rejected.length,
    catalog总数: merged.length,
  });
  logger.info('下一步：pnpm fetch:favicons 抓取官网图标，然后 pnpm validate:data 复核');
}

main();
