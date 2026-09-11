import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CategoryView } from '@/app/category-view';
import { CATEGORIES } from '@/data/registry';
import { localePath } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { buildMetadata, getSiteUrl } from '@/lib/seo';
import { getCategory } from '@/lib/sites';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const dict = getDictionary('en').category;
  const category = getCategory(slug);
  if (!category) return buildMetadata({ title: dict.notFound });

  const metadata = buildMetadata({
    title: `${category.nameEn}`,
    description: dict.metaDescription(category.description),
    path: `/category/${category.slug}`,
  });

  return {
    ...metadata,
    alternates: {
      canonical: `${getSiteUrl()}${localePath('en', `/category/${category.slug}`)}`,
      languages: {
        zh: `${getSiteUrl()}${localePath('zh', `/category/${category.slug}`)}`,
        en: `${getSiteUrl()}${localePath('en', `/category/${category.slug}`)}`,
      },
    },
  };
}

export default async function EnCategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  return <CategoryView category={category} locale="en" />;
}
