import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { SiteView } from '@/app/site-view';
import { localePath } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { buildMetadata, getSiteUrl } from '@/lib/seo';
import { getAllSites, getSiteById, getSiteDisplayName } from '@/lib/sites';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 3600;

export function generateStaticParams() {
  return getAllSites().map((site) => ({ id: site.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const dict = getDictionary('en').detail;
  const site = getSiteById(id);
  if (!site) return buildMetadata({ title: dict.notFound });

  const metadata = buildMetadata({
    title: `${getSiteDisplayName(site, 'en')} ${dict.titleSuffix}`,
    description: site.description,
    path: `/site/${site.id}`,
  });

  // 中英文互为 hreflang，canonical 指向自身语言版本
  return {
    ...metadata,
    alternates: {
      canonical: `${getSiteUrl()}${localePath('en', `/site/${site.id}`)}`,
      languages: {
        zh: `${getSiteUrl()}${localePath('zh', `/site/${site.id}`)}`,
        en: `${getSiteUrl()}${localePath('en', `/site/${site.id}`)}`,
      },
    },
  };
}

export default async function EnSitePage({ params }: PageProps) {
  const { id } = await params;
  const site = getSiteById(id);
  if (!site) notFound();

  return <SiteView site={site} locale="en" />;
}
