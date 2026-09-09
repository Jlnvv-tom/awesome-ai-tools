/**
 * 维护进度审计脚本（M2：待认领清单）
 *
 * 「未维护」判定：`curated === false`（无任何覆盖项）或简介仍为自动派生兜底文案。
 * 默认只输出汇总统计（遵循日志约定，不打印整表）；明细通过 `--json` / `--markdown` 导出。
 *
 * 用法：
 *   pnpm audit:curation              # 输出维护进度汇总
 *   pnpm audit:curation --json       # 导出 JSON 明细（供脚本/看板消费）
 *   pnpm audit:curation --markdown   # 导出 Markdown 认领清单（可贴到 Issue）
 */
import { getAllSites } from '../src/lib/sites';
import { CATEGORIES } from '../src/data/registry';
import { logger } from './utils/log';

const FALLBACK_DESCRIPTION_PATTERN = /^LobeHub Icons 收录的/;

function isUncurated(site: { curated: boolean; description: string }): boolean {
  return !site.curated || FALLBACK_DESCRIPTION_PATTERN.test(site.description);
}

function main() {
  const args = process.argv.slice(2);
  const asJson = args.includes('--json');
  const asMarkdown = args.includes('--markdown');

  const sites = getAllSites();
  const uncurated = sites.filter(isUncurated);
  const categoryNames = new Map(CATEGORIES.map((category) => [category.slug, category.name]));

  const groups = [...CATEGORIES]
    .sort((a, b) => a.order - b.order)
    .map((category) => {
      const total = sites.filter((site) => site.category === category.slug).length;
      const pending = uncurated.filter((site) => site.category === category.slug);
      return {
        category: category.slug,
        categoryName: category.name,
        total,
        pending: pending.length,
        rate: total === 0 ? 0 : Math.round(((total - pending.length) / total) * 1000) / 10,
        items: pending.map((site) => ({
          id: site.id,
          iconId: site.iconId,
          name: site.nameCn ?? site.name,
          category: site.category,
          url: site.url,
        })),
      };
    })
    .filter((group) => group.total > 0);

  if (asJson) {
    console.log(
      JSON.stringify({ total: sites.length, pending: uncurated.length, groups }, null, 2),
    );
    return;
  }

  if (asMarkdown) {
    const lines = ['# 待认领条目清单', ''];
    lines.push(
      `当前共 ${sites.length} 个条目，其中 **${uncurated.length}** 个尚未人工维护（缺少中文名或简介仍为兜底文案）。`,
      '',
      '认领方式：在 Issue 中回复要认领的分类，补全中文名与简介后提 PR。',
      '',
    );
    for (const group of groups) {
      if (group.items.length === 0) continue;
      const name = categoryNames.get(group.category) ?? group.category;
      lines.push(`## ${name}（${group.pending}/${group.total} 待认领，完成率 ${group.rate}%）`, '');
      for (const item of group.items) {
        lines.push(`- [ ] \`${item.iconId}\` ${item.name} — ${item.url}`);
      }
      lines.push('');
    }
    console.log(lines.join('\n'));
    return;
  }

  const rate = Math.round(((sites.length - uncurated.length) / sites.length) * 1000) / 10;
  logger.summary('数据维护进度', {
    条目总数: sites.length,
    已人工维护: sites.length - uncurated.length,
    待认领: uncurated.length,
    完成率: `${rate}%`,
  });

  for (const group of groups) {
    if (group.rate < 50) {
      logger.warn(
        `${group.categoryName}（${group.category}）完成率偏低：${group.rate}%，待认领 ${group.pending} 条`,
      );
    }
  }

  logger.info('查看明细：pnpm audit:curation --markdown（认领清单）或 --json（机器可读）');
}

main();
