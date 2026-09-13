/**
 * 自主收录条目审计（M5）
 *
 * 检查 `data/catalog/*.json` 的完整度：本地 favicon、中文名、品牌色、客观指标。
 * 默认只输出汇总；明细通过 `--json` / `--markdown` 导出（可贴到 Issue 当认领清单）。
 *
 * 用法：
 *   pnpm audit:catalog              # 输出汇总
 *   pnpm audit:catalog --json       # 导出 JSON 明细
 *   pnpm audit:catalog --markdown   # 导出 Markdown 待补清单
 */
import { CATALOG_ENTRIES, FAVICON_ID_SET } from '../src/data/registry';
import { logger } from './utils/log';

/** 建库时的中性占位色，需按官网 favicon 主色校正 */
const PLACEHOLDER_COLOR = '#6e56f8';

function main() {
  const args = process.argv.slice(2);
  const asJson = args.includes('--json');
  const asMarkdown = args.includes('--markdown');

  const summary = {
    total: CATALOG_ENTRIES.length,
    missingFavicon: CATALOG_ENTRIES.filter((entry) => !FAVICON_ID_SET.has(entry.id)).map(
      (entry) => entry.id,
    ),
    missingNameCn: CATALOG_ENTRIES.filter((entry) => !entry.nameCn).map((entry) => entry.id),
    placeholderColor: CATALOG_ENTRIES.filter((entry) => entry.color === PLACEHOLDER_COLOR).map(
      (entry) => entry.id,
    ),
    missingMetrics: CATALOG_ENTRIES.filter(
      (entry) => !entry.pricing && !entry.openSource && !entry.chineseSupport,
    ).map((entry) => entry.id),
  };

  if (asJson) {
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  if (asMarkdown) {
    const lines = ['# 自主收录条目待补清单', '', `共 ${summary.total} 条自主收录条目。`, ''];
    const sections: [string, string[]][] = [
      ['缺少本地图标（执行 `pnpm fetch:favicons` 抓取）', summary.missingFavicon],
      ['缺少中文名', summary.missingNameCn],
      ['品牌色仍为占位值（需按官网图标主色校正）', summary.placeholderColor],
      ['尚未补充客观指标（pricing / openSource / chineseSupport）', summary.missingMetrics],
    ];

    for (const [title, ids] of sections) {
      if (ids.length === 0) continue;
      lines.push(`## ${title}（${ids.length}）`, '');
      for (const id of ids) lines.push(`- [ ] \`${id}\``);
      lines.push('');
    }
    console.log(lines.join('\n'));
    return;
  }

  logger.summary('自主收录条目审计', {
    条目总数: summary.total,
    缺本地图标: summary.missingFavicon.length,
    缺中文名: summary.missingNameCn.length,
    品牌色待校正: summary.placeholderColor.length,
    缺客观指标: summary.missingMetrics.length,
  });

  if (summary.missingFavicon.length > 0) {
    logger.info('执行 pnpm fetch:favicons 抓取官网图标到 public/icons/');
  }
  logger.info('查看明细：pnpm audit:catalog --markdown（待补清单）或 --json（机器可读）');
}

main();
