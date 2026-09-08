import type { MetadataRoute } from 'next';

import { CATEGORIES } from '@/data/registry';
import { getAllSites } from '@/lib/sites';
import { getSiteUrl } from '@/lib/seo';

export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const lastModified = new Date();

  return [
    { url: base, lastModified, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/about`, lastModified, changeFrequency: 'monthly', priority: 0.4 },
    ...CATEGORIES.map((category) => ({
      url: `${base}/category/${category.slug}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...getAllSites().map((site) => ({
      url: `${base}/site/${site.id}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: site.featured ? 0.7 : 0.5,
    })),
  ];
}
