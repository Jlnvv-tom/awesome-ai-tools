/**
 * 图标同步脚本统一日志工具。
 *
 * 约定：
 * - 只输出 warn / error / 汇总统计，禁止打印整张数据表（避免 CI 日志污染）；
 * - 汇总统计统一走 `summary()`，输出 human readable 的键值对。
 */

type Level = 'info' | 'warn' | 'error' | 'success';

const COLORS: Record<Level, string> = {
  info: '\x1b[36m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
  success: '\x1b[32m',
};

const RESET = '\x1b[0m';
const LABEL: Record<Level, string> = {
  info: '•',
  warn: '!',
  error: '✗',
  success: '✓',
};

function write(level: Level, message: string, detail?: unknown) {
  const prefix = `${COLORS[level]}[${LABEL[level]}]${RESET}`;
  console.log(`${prefix} ${message}`);
  if (detail !== undefined) {
    console.log(detail);
  }
}

export const logger = {
  info: (message: string, detail?: unknown) => write('info', message, detail),
  warn: (message: string, detail?: unknown) => write('warn', message, detail),
  error: (message: string, detail?: unknown) => write('error', message, detail),
  success: (message: string, detail?: unknown) => write('success', message, detail),
  /** 输出阶段性汇总统计 */
  summary(title: string, stats: Record<string, number | string>) {
    const body = Object.entries(stats)
      .map(([key, value]) => `    ${key}: ${value}`)
      .join('\n');
    console.log(`\n${COLORS.success}[✓]${RESET} ${title}\n${body}\n`);
  },
};
