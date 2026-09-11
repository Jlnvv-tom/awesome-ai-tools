'use client';

import { useEffect } from 'react';

/**
 * 同步 `<html lang>`。
 *
 * 根布局在服务端只能输出一个固定 lang（Next.js 限制），
 * 多语言分支在挂载后由本组件纠正，保证读屏按正确语言发音。
 */
export function HtmlLang({ lang }: { lang: string }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return null;
}
