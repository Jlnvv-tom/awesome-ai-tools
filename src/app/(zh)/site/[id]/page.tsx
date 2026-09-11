import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { SiteView } from '@/app/site-view';
import { getDictionary } from '@/i18n/dictionaries';
import { buildMetadata } from '@/lib/seo';
import { getAllSites, getSiteById, getSiteDisplayName } from '@/lib/sites';
import type { Locale } from '@/i18n/config';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 3600;

export function generateStaticParams() {
  return getAllSites().map((site) => ({ id: site.id }));
}

function metadataFor(locale: Locale, id: string): Metadata {
  const dict = getDictionary(locale).detail;
  const site = getSiteById(id);
  if (!site) return buildMetadata({ title: dict.notFound });

  return buildMetadata({
    title: `${getSiteDisplayName(site, locale)} ${dict.titleSuffix}`,
    description: site.description,
    path: `/site/${site.id}`,
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return metadataFor('zh', id);
}

export default async function SitePage({ params }: PageProps) {
  const { id } = await params;
  const site = getSiteById(id);
  if (!site) notFound();

  return <SiteView site={site} locale="zh" />;
}
