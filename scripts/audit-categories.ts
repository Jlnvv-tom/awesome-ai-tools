/**
 * 归类审计脚本（M2：分类关键词持续优化）
 *
 * 输出两类归类置信度低的条目，作为补充 `data/categories.json` keywords 的依据：
 *   1. 兜底归类：未命中任何关键词，按 group 兜底落入 model / infra / agent
 *   2. 弱命中：只命中泛化关键词（如 model / cloud / image），归类结果不稳定
 * 同时输出分类分布，便于补充关键词后做回归对比。
 *
 * 用法：
 *   pnpm audit:categories             # 汇总 + 疑似错分明细（默认 30 条）
 *   pnpm audit:categories --json      # 导出完整明细
 *   pnpm audit:categories --limit=50  # 调整明细条数
 */
import { CATEGORIES } from '../src/data/registry';
import { getAllSites, getIconMeta } from '../src/lib/sites';
import { logger } from './utils/log';

/** 归类兜底映射，与 src/lib/sites.ts 保持一致 */
const GROUP_FALLBACK_CATEGORY: Record<string, string> = {
  model: 'model',
  provider: 'infra',
  application: 'agent',
};

/** 泛化关键词：命中它们不足以判定分类，需要更具体的关键词辅助 */
const GENERIC_KEYWORDS = new Set([
  'model',
  'cloud',
  'image',
  'video',
  'audio',
  'voice',
  'music',
  'agent',
  'search',
  'chat',
  'code',
  'llm',
  'api',
  'data',
  'design',
  'inference',
  'hosting',
]);

interface Suspicious {
  id: string;
  iconId: string;
  name: string;
  category: string;
  matched: string[];
  reason: 'fallback' | 'weak';
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function main() {
  const args = process.argv.slice(2);
  const asJson = args.includes('--json');
  const limitArg = args.find((arg) => arg.startsWith('--limit='));
  const limit = limitArg ? Number(limitArg.split('=')[1]) : 30;

  const sites = getAllSites();
  const suspicious: Suspicious[] = [];
  let fallbackCount = 0;
  let weakCount = 0;

  for (const site of sites) {
    const meta = getIconMeta(site.iconId);
    if (!meta) continue;

    const haystack = `${meta.fullTitle} ${meta.title} ${meta.id} ${hostOf(meta.url)}`.toLowerCase();
    const category = CATEGORIES.find((item) => item.slug === site.category);
    if (!category) continue;

    const matched = category.keywords.filter((keyword) => haystack.includes(keyword.toLowerCase()));
    const isFallback =
      matched.length === 0 && site.category === GROUP_FALLBACK_CATEGORY[meta.group];
    const isWeak = matched.length > 0 && matched.every((keyword) => GENERIC_KEYWORDS.has(keyword));

    if (isFallback) fallbackCount += 1;
    if (isWeak) weakCount += 1;
    if (!isFallback && !isWeak) continue;

    suspicious.push({
      id: site.id,
      iconId: site.iconId,
      name: site.nameCn ?? site.name,
      category: site.category,
      matched,
      reason: isFallback ? 'fallback' : 'weak',
    });
  }

  const distribution = [...CATEGORIES]
    .sort((a, b) => a.order - b.order)
    .map((category) => ({
      slug: category.slug,
      name: category.name,
      count: sites.filter((site) => site.category === category.slug).length,
    }));

  if (asJson) {
    console.log(JSON.stringify({ fallbackCount, weakCount, distribution, suspicious }, null, 2));
    return;
  }

  logger.summary('归类置信度审计', {
    条目总数: sites.length,
    兜底归类: fallbackCount,
    仅命中泛化词: weakCount,
    疑似错分合计: suspicious.length,
  });

  for (const item of distribution) {
    logger.info(`${item.name}（${item.slug}）：${item.count} 条`);
  }

  for (const item of suspicious.slice(0, limit)) {
    const label = item.reason === 'fallback' ? '兜底归类' : '仅命中泛化词';
    logger.warn(
      `${label}：${item.name}（${item.iconId}）→ ${item.category}${item.matched.length > 0 ? ` 命中：${item.matched.join(', ')}` : ''}`,
    );
  }

  if (suspicious.length > limit) {
    logger.info(`其余 ${suspicious.length - limit} 条已省略，使用 --json 或 --limit 查看全部`);
  }
}

main();
