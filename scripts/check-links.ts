/**
 * 官网可达性巡检脚本（M2：检测 404 / 重定向）
 *
 * 并发探测全部站点官网，把结果归类为 ok / redirect / not_found / blocked / server_error /
 * client_error / timeout / dns_error。**退出码始终为 0**，只做报告、不阻断 CI。
 *
 * 用法：
 *   pnpm check:links                       # 汇总输出
 *   pnpm check:links --limit=30            # 只巡检前 30 条
 *   pnpm check:links --category=infra      # 只巡检指定分类
 *   pnpm check:links --output=report.json  # 报告写入文件（CI 作为 artifact 上传）
 *   pnpm check:links --json                # 报告打印到标准输出
 */
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { getAllSites } from '../src/lib/sites';
import type { Site } from '../src/types/site';
import { logger } from './utils/log';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const DEFAULT_CONCURRENCY = 8;
const REQUEST_TIMEOUT_MS = 8_000;
const MAX_ATTEMPTS = 2;
const USER_AGENT =
  'awesome-ai-tools-link-checker/1.0 (+https://github.com/Jlnvv-tom/awesome-ai-tools)';

type CheckStatus =
  | 'ok'
  | 'redirect'
  | 'not_found'
  | 'blocked'
  | 'client_error'
  | 'server_error'
  | 'timeout'
  | 'dns_error';

interface CheckResult {
  id: string;
  iconId: string;
  name: string;
  category: string;
  url: string;
  status: CheckStatus;
  code?: number;
  location?: string;
}

const STATUS_LABEL: Record<CheckStatus, string> = {
  ok: '可访问',
  redirect: '重定向',
  not_found: '疑似失效',
  blocked: '被拦截',
  client_error: '客户端错误',
  server_error: '服务端错误',
  timeout: '超时',
  dns_error: '无法解析',
};

function parseArgs() {
  const args = process.argv.slice(2);
  const read = (name: string): string | undefined =>
    args.find((arg) => arg.startsWith(`--${name}=`))?.split('=')[1];

  return {
    limit: Number(read('limit') ?? 0),
    category: read('category'),
    output: read('output'),
    asJson: args.includes('--json'),
    concurrency: Number(read('concurrency') ?? DEFAULT_CONCURRENCY),
  };
}

/** 去掉 www 后比较主机名，用于区分「同站跳转」与「域名变更」 */
function isSameHost(a: string, b: string): boolean {
  try {
    return new URL(a).hostname.replace(/^www\./, '') === new URL(b).hostname.replace(/^www\./, '');
  } catch {
    return false;
  }
}

function classify(code: number, location?: string): { status: CheckStatus; location?: string } {
  if (code >= 200 && code < 300) return { status: 'ok' };
  if (code === 301 || code === 302 || code === 307 || code === 308) {
    return { status: 'redirect', location };
  }
  if (code === 404 || code === 410) return { status: 'not_found' };
  if (code === 403 || code === 429) return { status: 'blocked' };
  if (code >= 400 && code < 500) return { status: 'client_error' };
  if (code >= 500) return { status: 'server_error' };
  return { status: 'client_error' };
}

async function probe(site: Site): Promise<CheckResult> {
  const base = {
    id: site.id,
    iconId: site.iconId,
    name: site.nameCn ?? site.name,
    category: site.category,
    url: site.url,
  };

  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const headers = { 'user-agent': USER_AGENT, accept: '*/*' };
      let response = await fetch(site.url, {
        method: 'HEAD',
        redirect: 'manual',
        signal: controller.signal,
        headers,
      });

      // 部分站点不支持 HEAD，回退 GET
      if (response.status === 405 || response.status === 501 || response.status === 400) {
        response = await fetch(site.url, {
          method: 'GET',
          redirect: 'manual',
          signal: controller.signal,
          headers,
        });
      }

      const location = response.headers.get('location') ?? undefined;

      // 命中重定向：跟随一次，区分「同站跳转（可忽略）」与「域名变更（建议更新）」
      if (response.status >= 300 && response.status < 400) {
        const followed = await fetch(site.url, {
          redirect: 'follow',
          signal: controller.signal,
          headers,
        });
        clearTimeout(timer);

        const finalUrl = followed.url || location || site.url;
        if (followed.ok) {
          return isSameHost(site.url, finalUrl)
            ? { ...base, status: 'ok', code: followed.status, location: finalUrl }
            : { ...base, status: 'redirect', code: response.status, location: finalUrl };
        }
        const { status } = classify(followed.status, finalUrl);
        return { ...base, status, code: followed.status, location: finalUrl };
      }

      clearTimeout(timer);

      const { status } = classify(response.status, location);
      return { ...base, status, code: response.status, location };
    } catch (error) {
      clearTimeout(timer);
      lastError = error;
    }
  }

  const message = String((lastError as Error)?.message ?? '');
  const isTimeout = message.includes('abort') || message.includes('timeout');
  return { ...base, status: isTimeout ? 'timeout' : 'dns_error' };
}

async function runPool(sites: Site[], concurrency: number): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  let cursor = 0;

  const workers = Array.from({ length: Math.min(concurrency, sites.length) }, async () => {
    while (cursor < sites.length) {
      const index = cursor;
      cursor += 1;
      results.push(await probe(sites[index]));
    }
  });

  await Promise.all(workers);
  return results;
}

async function main() {
  const options = parseArgs();
  let sites = getAllSites();
  if (options.category) sites = sites.filter((site) => site.category === options.category);
  if (options.limit > 0) sites = sites.slice(0, options.limit);

  if (sites.length === 0) {
    logger.warn('没有匹配的条目，已跳过巡检');
    return;
  }

  const startedAt = Date.now();
  logger.info(`开始巡检 ${sites.length} 个官网（并发 ${options.concurrency}）…`);
  const results = await runPool(sites, options.concurrency);
  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);

  const counts = results.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1;
    return acc;
  }, {});

  if (options.asJson || options.output) {
    const payload = JSON.stringify(
      { checkedAt: new Date().toISOString(), elapsed: `${elapsed}s`, counts, results },
      null,
      2,
    );
    if (options.output) {
      const target = resolve(ROOT, options.output);
      writeFileSync(target, `${payload}\n`, 'utf8');
      logger.success(`报告已写入 ${options.output}`);
    }
    if (options.asJson) console.log(payload);
  }

  logger.summary('官网可达性巡检', {
    巡检条目: results.length,
    耗时: `${elapsed}s`,
    可访问: counts.ok ?? 0,
    重定向: counts.redirect ?? 0,
    疑似失效: counts.not_found ?? 0,
    被拦截: counts.blocked ?? 0,
    服务端错误: counts.server_error ?? 0,
    超时: counts.timeout ?? 0,
    无法解析: counts.dns_error ?? 0,
  });

  for (const item of results.filter((entry) => entry.status !== 'ok').slice(0, 20)) {
    const detail = item.location ? ` → ${item.location}` : item.code ? `（HTTP ${item.code}）` : '';
    logger.warn(`${STATUS_LABEL[item.status]}：${item.name}（${item.id}）${detail}`);
  }
}

main().catch((error) => {
  logger.error('巡检失败（不阻断构建）', error);
});
