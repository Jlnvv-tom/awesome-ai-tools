import type { IconMeta, IconVariantFlags } from '../../src/types/site';

const FALLBACK_COLOR = '#6e56f8';

/** 将 #fff / #FFF 这类简写补齐为 #ffffff，非法值回退到品牌主色 */
export function normalizeColor(input?: string): string {
  const value = (input ?? '').trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(value)) return value;
  if (/^#[0-9a-f]{3}$/.test(value)) {
    const [, r, g, b] = value;
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return FALLBACK_COLOR;
}

/** 修正上游数据中的 URL 拼写错误（例如 `hhttps://deepai.org`） */
export function normalizeUrl(input?: string): string {
  const value = (input ?? '').trim();
  if (/^https?:\/\//i.test(value)) return value;
  const repaired = value.replace(/^h+(?=https?:\/\/)/i, '');
  return /^https?:\/\//i.test(repaired) ? repaired : '';
}

export function normalizeGroup(input: string): IconMeta['group'] {
  return input === 'model' || input === 'provider' || input === 'application'
    ? input
    : 'application';
}

export function normalizeParam(param: Partial<IconVariantFlags> = {}): IconVariantFlags {
  const keys: (keyof IconVariantFlags)[] = [
    'hasAvatar',
    'hasBrand',
    'hasBrandColor',
    'hasColor',
    'hasCombine',
    'hasText',
    'hasTextCn',
    'hasTextColor',
  ];
  return keys.reduce((acc, key) => {
    acc[key] = param[key] === true;
    return acc;
  }, {} as IconVariantFlags);
}
