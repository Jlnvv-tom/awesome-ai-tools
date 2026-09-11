/**
 * 维护进度审计脚本（M2：待认领清单）
 *
 * 判定规则与贡献看板页面共用 `src/lib/curation.ts`，避免两处口径不一致。
 * 默认只输出汇总统计（遵循日志约定，不打印整表）；明细通过 `--json` / `--markdown` 导出。
 *
 * 用法：
 *   pnpm audit:curation              # 输出维护进度汇总
 *   pnpm audit:curation --json       # 导出 JSON 明细（供脚本/看板消费）
 *   pnpm audit:curation --markdown   # 导出 Markdown 认领清单（可贴到 Issue）
 */
import { getCurationSummary } from '../src/lib/curation';
import { logger } from './utils/log';

function main() {
  const args = process.argv.slice(2);
  const asJson = args.includes('--json');
  const asMarkdown = args.includes('--markdown');

  const summary = getCurationSummary();

  if (asJson) {
    console.log(
      JSON.stringify(
        {
          total: summary.total,
          maintained: summary.maintained,
          pending: summary.pending.length,
          rate: summary.rate,
          groups: summary.groups.map((group) => ({
            category: group.category.slug,
            categoryName: group.category.name,
            total: group.total,
            pending: group.pending.length,
            rate: group.rate,
            items: group.pending.map((site) => ({
              id: site.id,
              iconId: site.iconId,
              name: site.nameCn ?? site.name,
              category: site.category,
              url: site.url,
            })),
          })),
        },
        null,
        2,
      ),
    );
    return;
  }

  if (asMarkdown) {
    const lines = [
      '# 待认领条目清单',
      '',
      `当前共 ${summary.total} 个条目，其中 **${summary.pending.length}** 个尚未人工维护（缺少中文名或简介仍为兜底文案）。`,
      '',
      '认领方式：在 Issue 中回复要认领的分类，补全中文名与简介后提 PR。',
      '',
    ];
    for (const group of summary.groups) {
      if (group.pending.length === 0) continue;
      lines.push(
        `## ${group.category.name}（${group.pending.length}/${group.total} 待认领，完成率 ${group.rate}%）`,
        '',
      );
      for (const site of group.pending) {
        lines.push(`- [ ] \`${site.iconId}\` ${site.nameCn ?? site.name} — ${site.url}`);
      }
      lines.push('');
    }
    console.log(lines.join('\n'));
    return;
  }

  logger.summary('数据维护进度', {
    条目总数: summary.total,
    已人工维护: summary.maintained,
    待认领: summary.pending.length,
    完成率: `${summary.rate}%`,
  });

  for (const group of summary.groups) {
    if (group.rate < 50) {
      logger.warn(
        `${group.category.name}（${group.category.slug}）完成率偏低：${group.rate}%，待认领 ${group.pending.length} 条`,
      );
    }
  }

  logger.info('查看明细：pnpm audit:curation --markdown（认领清单）或 --json（机器可读）');
}

main();
