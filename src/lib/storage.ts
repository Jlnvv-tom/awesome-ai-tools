/**
 * 本地存储抽象（收藏夹、使用统计、视图偏好的统一入口）。
 *
 * 约定：
 * - 所有 key 带版本前缀，便于后续迁移与清理；
 * - 服务端渲染（SSG）期间不可用，读写均返回兜底值，避免污染静态产物；
 * - 隐私模式或配额超限时降级为「不持久化」，不抛错中断交互。
 */

const PREFIX = 'ait:v1:';

export const STORAGE_KEYS = {
  favorites: 'favorites',
  usage: 'usage',
  viewMode: 'view-mode',
} as const;

function fullKey(key: string): string {
  return `${PREFIX}${key}`;
}

function isAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/** 读取 JSON，缺失或解析失败时返回兜底值 */
export function readJson<T>(key: string, fallback: T): T {
  if (!isAvailable()) return fallback;
  try {
    const raw = window.localStorage.getItem(fullKey(key));
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`[storage] 读取 ${key} 失败，已回退默认值`, error);
    return fallback;
  }
}

/** 写入 JSON，返回是否成功（失败时调用方仍可继续内存态交互） */
export function writeJson(key: string, value: unknown): boolean {
  if (!isAvailable()) return false;
  try {
    window.localStorage.setItem(fullKey(key), JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`[storage] 写入 ${key} 失败（隐私模式或配额超限）`, error);
    return false;
  }
}

/** 删除指定 key */
export function removeKey(key: string): void {
  if (!isAvailable()) return;
  try {
    window.localStorage.removeItem(fullKey(key));
  } catch (error) {
    console.error(`[storage] 删除 ${key} 失败`, error);
  }
}

/** 订阅指定 key 的跨标签页变化，返回取消订阅函数 */
export function subscribe(key: string, listener: () => void): () => void {
  if (!isAvailable()) return () => {};
  const target = fullKey(key);
  const handler = (event: StorageEvent) => {
    if (event.key === null || event.key === target) listener();
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}
