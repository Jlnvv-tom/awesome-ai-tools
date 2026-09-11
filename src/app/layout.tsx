import type { Metadata, Viewport } from 'next';

import './globals.css';

import { ThemeProvider } from '@/components/layout/theme-provider';
import { PersonalizationProvider } from '@/components/personalization-provider';
import { SearchProvider } from '@/components/search/search-provider';
import { ShortcutsProvider } from '@/components/shortcuts/shortcuts-provider';
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, getSiteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${SITE_NAME} · ${SITE_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ['AI 导航', 'AI 工具', 'AI 工具导航', 'LobeHub Icons', 'AI 模型', '开源导航站'],
  authors: [{ name: 'Awesome AI Tool contributors' }],
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: getSiteUrl(),
  },
  twitter: { card: 'summary_large_image', title: SITE_NAME, description: SITE_DESCRIPTION },
  robots: { index: true, follow: true },
  alternates: {
    types: { 'application/rss+xml': `${getSiteUrl()}/rss.xml` },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0f' },
    { media: '(prefers-color-scheme: light)', color: '#f7f8fa' },
  ],
};

/**
 * 根布局：只提供 html 外壳与全局 Provider。
 *
 * 页头页脚由各语言分支的布局提供（`(zh)/layout.tsx` 与 `en/layout.tsx`），
 * 因为只有根布局能声明 `<html>`，而 lang 需要按语言分支纠正（见 HtmlLang）。
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen bg-background">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground"
        >
          跳到主内容
        </a>
        <ThemeProvider>
          <SearchProvider>
            <ShortcutsProvider>
              <PersonalizationProvider>{children}</PersonalizationProvider>
            </ShortcutsProvider>
          </SearchProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
