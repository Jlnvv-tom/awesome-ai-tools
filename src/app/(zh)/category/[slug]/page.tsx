import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CategoryView } from '@/app/category-view';
import { CATEGORIES } from '@/data/registry';
import { getDictionary } from '@/i18n/dictionaries';
import { buildMetadata } from '@/lib/seo';
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
  const category = getCategory(slug);
  const dict = getDictionary('zh').category;
  if (!category) return buildMetadata({ title: dict.notFound });

  return buildMetadata({
    title: `${category.name} · ${category.nameEn}`,
    description: dict.metaDescription(category.description),
    path: `/category/${category.slug}`,
  });
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  return <CategoryView category={category} locale="zh" />;
}
