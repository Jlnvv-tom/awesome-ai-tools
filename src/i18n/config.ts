/**
 * 语言配置（自建轻量 i18n，无第三方依赖）。
 *
 * 约定：中文为默认语言且位于根路径，英文位于 `/en` 前缀，
 * 所有内部跳转必须经 `localePath()` 生成，避免语言切换后跳转错乱。
 */

export const LOCALES = ['zh', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'zh';

/** 各语言的路由前缀（默认语言不带前缀） */
const LOCALE_PREFIX: Record<Locale, string> = {
  zh: '',
  en: '/en',
};

/** 各语言的 html lang 取值 */
export const HTML_LANG: Record<Locale, string> = {
  zh: 'zh-CN',
  en: 'en',
};

/** 生成带语言前缀的内部链接 */
export function localePath(locale: Locale, path = '/'): string {
  const suffix = path === '/' || path === '' ? '' : path.startsWith('/') ? path : `/${path}`;
  return `${LOCALE_PREFIX[locale]}${suffix}` || '/';
}

/** 从路径中解析语言（用于英文分支的静态页面与链接生成） */
export function isLocale(value: string | undefined): value is Locale {
  return value === 'zh' || value === 'en';
}
