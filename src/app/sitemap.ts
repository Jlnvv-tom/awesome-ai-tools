import type { MetadataRoute } from 'next';

import { CATEGORIES } from '@/data/registry';
import { LOCALES, localePath } from '@/i18n/config';
import { getAllSites } from '@/lib/sites';
import { getSiteUrl } from '@/lib/seo';

export const revalidate = 3600;

/** 输出中英文两套 URL，并互相声明 hreflang */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const lastModified = new Date();

  const paths = [
    { path: '/', priority: 1, changeFrequency: 'daily' as const },
    { path: '/contributors', priority: 0.5, changeFrequency: 'weekly' as const },
    { path: '/about', priority: 0.4, changeFrequency: 'monthly' as const },
    ...CATEGORIES.map((category) => ({
      path: `/category/${category.slug}`,
      priority: 0.8,
      changeFrequency: 'weekly' as const,
    })),
    ...getAllSites().map((site) => ({
      path: `/site/${site.id}`,
      priority: site.featured ? 0.7 : 0.5,
      changeFrequency: 'monthly' as const,
    })),
  ];

  return paths.flatMap((item) =>
    LOCALES.map((locale) => ({
      url: `${base}${localePath(locale, item.path)}`,
      lastModified,
      changeFrequency: item.changeFrequency,
      priority: locale === 'zh' ? item.priority : Number((item.priority * 0.9).toFixed(2)),
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((code) => [code, `${base}${localePath(code, item.path)}`]),
        ),
      },
    })),
  );
}
