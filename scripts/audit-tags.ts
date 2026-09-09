/**
 * 标签审计脚本（M2：标签体系二次梳理，收敛同义标签）
 *
 * 统计受控词表 `data/tags.json` 中每个标签在覆盖项里的使用频次，输出：
 *   - 零使用标签（可从词表移除）
 *   - 低频标签（仅 1 次使用）
 *   - 同义组建议（成员频次与涉及条目数）
 * `--apply` 会按内置映射收敛：替换 `data/sites/*.json` 中的旧标签并同步更新词表。
 *
 * 用法：
 *   pnpm audit:tags            # 输出频次与同义建议
 *   pnpm audit:tags --json     # 导出统计明细
 *   pnpm audit:tags --apply    # 执行收敛（替换标签 + 更新词表）
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { SITE_OVERRIDES, TAGS } from '../src/data/registry';
import type { SiteOverride } from '../src/types/site';
import { logger } from './utils/log';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SITES_DIR = resolve(ROOT, 'data/sites');
const TAGS_FILE = resolve(ROOT, 'data/tags.json');

/** 同义收敛映射：members → canonical（canonical 必须在词表中且语义更通用） */
const SYNONYM_GROUPS: { canonical: string; members: string[] }[] = [
  { canonical: 'aggregator', members: ['directory'] },
  { canonical: 'ai-search', members: ['search-engine'] },
  { canonical: 'tts', members: ['speech-to-text'] },
  { canonical: 'voice', members: ['audio'] },
  { canonical: 'notes', members: ['notebook'] },
  { canonical: 'workflow', members: ['automation', 'orchestration', 'canvas'] },
  { canonical: 'self-hosted', members: ['local'] },
  { canonical: 'framework', members: ['sdk'] },
];

/** 长期无条目使用且语义过泛，建议从词表移除 */
const RETIRE_TAGS = ['data', 'mobile', '3d'];

const ALIAS_MAP = new Map<string, string>();
for (const group of SYNONYM_GROUPS) {
  for (const member of group.members) ALIAS_MAP.set(member, group.canonical);
}

function countUsages(): Map<string, number> {
  const usage = new Map<string, number>();
  for (const tag of TAGS) usage.set(tag, 0);
  for (const override of SITE_OVERRIDES) {
    for (const tag of override.tags ?? []) {
      usage.set(tag, (usage.get(tag) ?? 0) + 1);
    }
  }
  return usage;
}

function applyConsolidation(usage: Map<string, number>) {
  let changedFiles = 0;
  let changedEntries = 0;

  for (const file of readdirSync(SITES_DIR)
    .filter((name) => name.endsWith('.json'))
    .sort()) {
    const path = resolve(SITES_DIR, file);
    const items = JSON.parse(readFileSync(path, 'utf8')) as SiteOverride[];
    let fileChanged = false;

    const next = items.map((item) => {
      if (!item.tags || item.tags.length === 0) return item;
      const mapped = item.tags.map((tag) => ALIAS_MAP.get(tag) ?? tag);
      const deduped = [...new Set(mapped)];
      if (deduped.join('|') === item.tags.join('|')) return item;
      fileChanged = true;
      changedEntries += 1;
      return { ...item, tags: deduped };
    });

    if (!fileChanged) continue;
    writeFileSync(path, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
    changedFiles += 1;
  }

  const nextTags = TAGS.filter((tag) => !ALIAS_MAP.has(tag) && !RETIRE_TAGS.includes(tag));
  const removedTags = TAGS.filter((tag) => ALIAS_MAP.has(tag) || RETIRE_TAGS.includes(tag));
  if (nextTags.length !== TAGS.length) {
    writeFileSync(TAGS_FILE, `${JSON.stringify(nextTags, null, 2)}\n`, 'utf8');
  }

  logger.summary('标签收敛完成', {
    改动分片: changedFiles,
    改动条目: changedEntries,
    词表原有: TAGS.length,
    词表现有: nextTags.length,
    移除标签: removedTags.length,
  });

  for (const tag of removedTags) {
    logger.info(`移除标签 ${tag}（原使用 ${usage.get(tag) ?? 0} 次）`);
  }

  logger.info('请继续执行 pnpm validate:data 与 pnpm build:search');
}

function main() {
  const args = process.argv.slice(2);
  const asJson = args.includes('--json');
  const shouldApply = args.includes('--apply');

  const usage = countUsages();
  const unused = TAGS.filter((tag) => (usage.get(tag) ?? 0) === 0);
  const rare = TAGS.filter((tag) => (usage.get(tag) ?? 0) === 1);

  const groups = SYNONYM_GROUPS.map((group) => ({
    canonical: group.canonical,
    members: group.members,
    canonicalCount: usage.get(group.canonical) ?? 0,
    memberCounts: group.members.map((member) => ({ tag: member, count: usage.get(member) ?? 0 })),
  }));

  if (shouldApply) {
    applyConsolidation(usage);
    return;
  }

  if (asJson) {
    console.log(
      JSON.stringify(
        {
          total: TAGS.length,
          usage: Object.fromEntries(usage),
          unused,
          rare,
          groups,
          retire: RETIRE_TAGS,
        },
        null,
        2,
      ),
    );
    return;
  }

  logger.summary('标签使用分析', {
    词表标签数: TAGS.length,
    零使用标签: unused.length,
    低频标签: rare.length,
    同义组: SYNONYM_GROUPS.length,
    建议移除: RETIRE_TAGS.length,
  });

  if (unused.length > 0) logger.warn(`零使用标签：${unused.join(', ')}`);
  if (rare.length > 0) logger.info(`低频标签（1 次）：${rare.join(', ')}`);

  for (const group of groups) {
    const detail = group.memberCounts.map((member) => `${member.tag}(${member.count})`).join(' + ');
    logger.info(`${detail} → ${group.canonical}(${group.canonicalCount})`);
  }

  logger.info('执行收敛：pnpm audit:tags --apply（随后需跑 validate:data 与 build:search）');
}

main();
