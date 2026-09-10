import type { Metadata, Viewport } from 'next';

import './globals.css';

import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { PersonalizationProvider } from '@/components/personalization-provider';
import { SearchProvider } from '@/components/search/search-provider';
import { ShortcutsProvider } from '@/components/shortcuts/shortcuts-provider';
import { getCategoriesWithCount } from '@/lib/sites';
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
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0f' },
    { media: '(prefers-color-scheme: light)', color: '#f7f8fa' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const categories = getCategoriesWithCount();
  const navItems = categories.map((category) => ({
    slug: category.slug,
    name: category.name,
    count: category.count,
  }));

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
              <PersonalizationProvider>
                <SiteHeader navItems={navItems} />
                <main id="main" className="pt-16">
                  {children}
                </main>
                <SiteFooter total={categories.reduce((sum, item) => sum + item.count, 0)} />
              </PersonalizationProvider>
            </ShortcutsProvider>
          </SearchProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
